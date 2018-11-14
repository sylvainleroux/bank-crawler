let config;
try {
  config = require("/etc/bank-crawler/config.json");
} catch (e) {
  throw "Config file doesn't exists";
}

if (config.login === "" || config.password === "") {
  throw "Config file should be initialized";
}

module.exports = {
  login: config.login,
  password: config.password,
  getValue: function(key, defaultValue) {
    if (config.hasOwnProperty(key)) {
      return config[key];
    } else {
      return defaultValue;
    }
  }
};
