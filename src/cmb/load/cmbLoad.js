const fs = require("fs");
const path = require("path");
const glob = require("glob-fs")();
const csv = require("csv-parser");
const repo = "/var/lib/bank-crawler/";
const crc = require("crc-32");
const moment = require("moment");
const Sequelize = require("sequelize");

const config = require("../../utils/config");

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
        console.log(error);
        reject(error);
      });
  });
}

async function markFileImported(file) {
  console.log("archive file: " + file);
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
      host: db_config.host,
      dialect: "mysql",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

  try {
    await sequelize.authenticate();
  } catch (e) {
    sequelize.close();
    console.error(e);
    process.exit(1);
  }

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

  var files = glob.readdirSync("RELEVE_*.csv", { cwd: repo });

  for (var i = 0, len = files.length; i < len; i++) {
    var f = files[i];
    let filename = path.join(repo, f);
    var data = await parseFile(filename);
    await Operation.bulkCreate(data, {
      ignoreDuplicates: true,
      updateOnDuplicate: false
    });
    console.log("finished " + f);

    await markFileImported(f);
  }

  sequelize.close();
};
