const fs = require("fs");
const path = require("path");

module.exports = function(exports, directory) {
  exports.forEach(element => {
    var filename = path.join(directory, element.filename);
    console.log(filename);
    fs.writeFileSync(filename, element.content);
  });
};
