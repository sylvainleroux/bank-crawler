// config2.js
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  db_host: process.env.MYSQL_BANK_HOST,
  db_port: process.env.MYSQL_BANK_PORT,
  db_user: process.env.MYSQL_BANK_USERNAME,
  db_password: process.env.MYSQL_BANK_PASSWORD,
  db_schema: process.env.MYSQL_BANK_DB,
  repo: process.env.FILE_REPOSITORY,
  login: process.env.CREDENTIALS_LOGIN,
  password: process.env.CREDENTIALS_PWD,
  cron_expression: process.env.CRON_EXPRESSION || "0 * * * *",
  chrome_executable: process.env.CHROME_EXEC,
};
