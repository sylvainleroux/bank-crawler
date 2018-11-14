const phantom = require("phantom");
const writeToFile = require("../../utils/writeToFile");

module.exports = async function() {
  const instance = await phantom.create();
  const page = await instance.createPage();

  await page.setting("loadImages", false);

  await page.on("onResourceRequested", function(requestData) {
    //console.info("Requesting", requestData.url);
  });

  await page.on("onConsoleMessage", true, function(msg) {
    console.log(msg);
  });

  // Open Website main page

  console.log("Start loading page");
  const status = await page.open(
    "https://www.cmb.fr/banque/assurance/credit-mutuel/web/j_6/accueil"
  );

  if (status !== "success") {
    console.log("Unable to reach network");
    return;
  } else {
    console.log(status);
  }

  try {
    const authSuccess = await require("./stages/authentication")(page);

    if (!authSuccess) throw new Error("Unable to authenticate, aborting.");

    let balance = await require("./stages/readBalance")(page);
    console.log(balance);

    let exports = await require("./stages/download")(page);

    writeToFile(exports, "/var/lib/bank-crawler");

    // -----
  } catch (e) {
    console.error(e);
  } finally {
    await instance.exit();
  }
};
