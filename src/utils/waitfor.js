const logger = require("./logger");

module.exports = async function(testFunction, timeoutMilliseconds) {
  var maxTimeout = timeoutMilliseconds ? timeoutMilliseconds : 3000;
  start = Date.now();
  condition = false;

  logger.debug("start wait for");

  return new Promise((resolve, reject) => {
    interval = setInterval(async function() {
      logger.debug(" -> iteration ");
      condition = await testFunction();
      if (Date.now() - start > maxTimeout || condition) {
        clearInterval(interval);
        condition && resolve();
        reject("Timeout reached (" + maxTimeout + ")");
      }
    }, 150);
  });
};
