let credentials;
try {
  credentials = require("/etc/bank-crawler/config.json");
} catch (e) {
  throw "Config file doesn't exists";
}

if (credentials.login === "" || credentials.password === "") {
  throw "Config file should be initialized";
}

module.exports = {
  login: credentials.login,
  password: credentials.password
};
