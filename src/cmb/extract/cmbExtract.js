const phantom = require("phantom");
const writeToFile = require("../../utils/writeToFile");
const logger = require("../../utils/logger");

module.exports = async function() {
  const instance = await phantom.create();
  const page = await instance.createPage();

  await page.setting("loadImages", false);

  await page.on("onResourceRequested", function(requestData) {
    //console.info("Requesting", requestData.url);
  });

  await page.on("onConsoleMessage", true, function(msg) {
    logger.debug(msg);
  });

  // Open Website main page

  logger.info("Start loading page");
  const status = await page.open(
    "https://www.cmb.fr/banque/assurance/credit-mutuel/web/j_6/accueil"
  );

  if (status !== "success") {
    logger.error("Unable to reach network");
    return;
  } else {
    logger.info(status);
  }

  try {
    const authSuccess = await require("./stages/authentication")(page);

    if (!authSuccess) throw new Error("Unable to authenticate, aborting.");

    let balance = await require("./stages/readBalance")(page);
    //logger.info(balance);

    let exports = await require("./stages/download")(page);

    writeToFile(exports, "/var/lib/bank-crawler");

    // -----
  } catch (e) {
    logger.error(e);
  } finally {
    await instance.exit();
  }
};
