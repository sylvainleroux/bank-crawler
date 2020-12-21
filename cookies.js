const fs = require('fs');
const path = require('path');
const   logger = require("./src/logger");
const   config = require("./src/config");




const cookiesString =  fs.readFileSync(path.join(config.repo, "./cookies.json"));
const cookies = JSON.parse(cookiesString);


console.log(cookies);



console.log(retained);