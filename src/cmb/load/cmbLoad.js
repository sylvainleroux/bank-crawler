const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const repo = "/var/lib/bank-crawler/";
const crc = require("crc-32");
const moment = require("moment");
const Sequelize = require("sequelize");
const glob = require("glob-fs");
const config = require("../../utils/config");
const logger = require("../../utils/logger");

logger.info("Start cmbLoad.js");

patterns = [
  {
    pattern: /.*_PLAN EPARGNE LOGEMENT_.*/,
    account: "CMB.PEL"
  },
  {
    pattern: /.*_COMPTE CHEQUES 1_.*/,
    account: "CMB.COMPTE_CHEQUE"
  },
  {
    pattern: /.*LIVRET DEV. DURABLE ET SOLIDAIRE_S.*/,
    account: "CMB.LDDS"
  },
  {
    pattern: /.*LIVRET CMB.*/,
    account: "CMB.LIVRET_CMB"
  }
];

class Op {
  constructor(row, compte) {
    this.compte = compte;
    this.date_operation = moment(row.date_operation, "DD/MM/YYYY");
    this.date_valeur = moment(row.date_valeur, "DD/MM/YYYY");
    this.libelle = row.libelle;
    this.debit = row.debit.replace(/,/, ".");
    this.credit = row.credit.replace(/,/, ".");
  }
  hashCode() {
    return crc.str(JSON.stringify(this));
  }
}

async function parseFile(filename) {
  let compte = patterns.filter(p => filename.match(p.pattern))[0].account;

  return new Promise((resolve, reject) => {
    var lines = [];
    var lineHashes = [];
    fs.createReadStream(filename)
      .pipe(
        csv({
          separator: ";",
          quote: '"',
          mapHeaders: ({ header, index }) =>
            header.toLowerCase().replace(/ /g, "_")
        })
      )
      .on("data", data => {
        let operation = new Op(data, compte);
        let libelle = operation.libelle;
        let duplicateCount = 2;

        while (lineHashes.includes(operation.hashCode())) {
          operation.libelle = libelle + " DUPLICATE(" + duplicateCount++ + ")";
        }
        lineHashes.push(operation.hashCode());
        lines.push(operation);
      })
      .on("end", () => {
        resolve(lines);
      })
      .on("error", error => {
        logger.error(error);
        reject(error);
      });
  });
}

async function markFileImported(file) {
  fs.renameSync(path.join(repo, file), path.join(repo, "IMPORTED_" + file));
}

module.exports = async function() {
  db_config = config.getValue("database", {});

  let sequelize;

  sequelize = await new Sequelize(
    db_config.schema,
    db_config.user,
    db_config.password,
    {
      logging: msg => logger.debug(msg),
      host: db_config.host,
      dialect: "mysql",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      operatorsAliases: false
    }
  );

  try {
    logger.info("authenticate");
    await sequelize.authenticate();

    const Operation = sequelize.define(
      "operation",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        compte: Sequelize.STRING,
        date_operation: Sequelize.DATEONLY,
        date_valeur: Sequelize.DATEONLY,
        libelle: Sequelize.STRING,
        debit: Sequelize.DECIMAL(10, 2),
        credit: Sequelize.DECIMAL(10, 2)
      },
      {
        freezeTableName: true,
        timestamps: false
      }
    );

    globInstance = glob();
    var files = globInstance.readdirSync("RELEVE_*.csv", { cwd: repo });

    for (var i = 0, len = files.length; i < len; i++) {
      var f = files[i];
      let filename = path.join(repo, f);
      logger.info("Parse-- " + f);
      var data = await parseFile(filename);
      await Operation.bulkCreate(data, {
        ignoreDuplicates: true,
        updateOnDuplicate: false
      });
      logger.info("done--- " + f);

      await markFileImported(f);
    }
  } catch (e) {
    // do nothing
  } finally {
    sequelize.close();
  }
};
