const fs = require("fs"),
  path = require("path"),
  csv = require("csv-parser"),
  crc = require("crc-32"),
  moment = require("moment"),
  Sequelize = require("sequelize"),
  glob = require("glob-fs"),
  config = require("../config"),
  logger = require("../logger");

logger.info("Start cmbLoad.js");

const patterns = [
  {
    pattern: /.*RELEVE_PLAN_EPARGNE_LOGEMENT_.*/,
    account: "CMB.PEL",
  },
  {
    pattern: /.*RELEVE_COMPTE_CHEQUES_1_.*/,
    account: "CMB.COMPTE_CHEQUE",
  },
  {
    pattern: /.*RELEVE_LIVRET_DEV._DURABLE_ET_SOLIDAIRE_.*/,
    account: "CMB.LDDS",
  },
  {
    pattern: /.*RELEVE_LIVRET_CMB_.*/,
    account: "CMB.LIVRET_CMB",
  },
  {
    pattern: /.*RELEVE_CONVENTION_CAPITAL_PLUS_.*/,
    account: "CMB.CAPITAL_PLUS",
  },
  {
    pattern: /.*RELEVE_COMPTE_COMMUN_.*/,
    account: "CMB.COMPTE_COMMUN"
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
  let found = patterns.filter((p) => filename.match(p.pattern));
  let compte = null;

  if (found && found.length > 0) {
    compte = found[0].account;
  } else {
    throw new Error("Could not match an account");
  }

  return new Promise((resolve, reject) => {
    var lines = [];
    var lineHashes = [];
    fs.createReadStream(filename)
      .pipe(
        csv({
          separator: ";",
          quote: '"',
          mapHeaders: ({ header, index }) =>
            header.toLowerCase().replace(/ /g, "_"),
        })
      )
      .on("data", (data) => {
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
      .on("error", (error) => {
        logger.error(error);
        reject(error);
      });
  });
}

async function deleteImportedFile(file) {
  fs.unlinkSync(path.join(config.repo, file));
}

module.exports = async function () {
  let sequelize;

  sequelize = await new Sequelize(
    config.db_schema,
    config.db_user,
    config.db_password,
    {
      logging: (msg) => logger.debug(msg),
      host: config.db_host,
      dialect: "mysql",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      operatorsAliases: false,
    }
  );

  try {
    logger.info("Connect to database");
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
        credit: Sequelize.DECIMAL(10, 2),
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );

    const globInstance = glob();
    var files = globInstance.readdirSync("RELEVE_*.csv", { cwd: config.repo });

    for (var i = 0, len = files.length; i < len; i++) {
      var f = files[i];
      let filename = path.join(config.repo, f);
      logger.info("Parse-- " + f);
      let data;
      try {
        data = await parseFile(filename);
      } catch (e) {
        console.log(e);
        continue;
      }
      await Operation.bulkCreate(data, {
        ignoreDuplicates: true,
        updateOnDuplicate: false,
      });
      logger.info("done--- " + f);

      await deleteImportedFile(f);
    
    }
  } catch (e) {
    console.log(e);
  } finally {
    sequelize.close();
  }
};
