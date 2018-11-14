const waitForPageEval = require("../../../utils/waitForPageEval");
const sleep = require("../../../utils/sleep");

const credentials = require("../../../utils/config");

module.exports = async function(page) {
  await waitForPageEval(page, function() {
    console.log("test");
    return jQuery("#connexion-bouton > a").is(":visible");
  });

  console.log("Click on login button");
  await page.evaluate(function() {
    jQuery("#connexion-bouton > a").click();
  });

  console.log("Wait until login form is visible");

  await waitForPageEval(page, function() {
    return jQuery("#identifiant").is(":visible");
  });

  console.log("Fill form with login and password");

  await page.evaluate(function(login) {
    jQuery("#identifiant").val(login);
  }, credentials.login);

  await page.sendEvent("keypress", 16777217); // Tab

  await sleep(500);

  await page.evaluate(function(password) {
    jQuery("#password").val(password);
  }, credentials.password);

  console.log("submitAuthenticationForm");

  await page.evaluate(function() {
    document
      .querySelectorAll("#formPassword > div.wrap-btn.wrap-btn-1x > button")[1]
      .click();
  });
  await sleep(1000);

  try {
    console.log("waitMainPageLoaded");
    await waitForPageEval(
      page,
      function() {
        try {
          //console.log("iter");
          var objects = document.querySelectorAll("#principal");
          if (
            objects.length > 0 &&
            objects[0].offsetHeight &&
            objects[0].offsetHeight > 600
          )
            return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      },
      20000
    );

    await sleep(1000);

    // Additional verification
    return (await page.cookies()).map(c => c.name).includes("utils");
  } catch (e) {
    return false;
  }
};
