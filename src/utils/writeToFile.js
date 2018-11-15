const fs = require("fs");
const path = require("path");
const logger = require("./logger");

module.exports = function(exports, directory) {
  exports.forEach(element => {
    var filename = path.join(directory, element.filename);
    logger.info(filename);
    fs.writeFileSync(filename, element.content);
  });
};
