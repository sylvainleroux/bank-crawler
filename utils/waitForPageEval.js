const waitfor = require("./waitfor");

// Util to re-evaluate on page every 150ms
module.exports = async function(page, eval, timeout) {
  return await waitfor(async () => {
    return await page.evaluate(eval);
  }, timeout);
};
