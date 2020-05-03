const bs = require("../BrowserSession"),
  config = require("../config"),
  logger = require("../logger"),
  path = require("path");

const auth = async function (bs) {
  logger.info("Start authentication");
  const page = bs.page;
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
  );
  await page.goto("https://mon.cmb.fr/auth/login", {
    waitUntil: "networkidle2",
  });
  logger.info("-- set login");
  await page.waitForSelector("#userLogin");
  await page.type("#userLogin", config.login);
  await page.click("#auth-c_1 > button");
  logger.info("-- set password");
  await page.waitForSelector("#userPassword");
  await page.type("#userPassword", config.password);
  logger.info("-- validate form");
  await page.click(
    "#formLogin > div.c-auth__dropdown.ng-scope > div:nth-child(2) > input"
  );
  await page.waitForNavigation();
  logger.info("Authentication completed");
};

const extract = async function (bs) {
  logger.info("Start extract");
  logger.info("-- load transactions page");
  const page = bs.page;
  await page.waitForNavigation();
  await page.goto("https://mon.cmb.fr/transactions");

  // Click on "Recherche"
  logger.info("-- search for operations");
  await page.waitForSelector("#searchButton > button", { visible: true });
  await page.screenshot({ path: path.join(config.repo, "screenshot_1.png") });
  await page.waitFor(5000);
  await page.screenshot({ path: path.join(config.repo, "screenshot_2.png") });
  await page.click("#searchButton > button");

  // Wait for data
  logger.info("-- Wait page load complete");
  await page.waitFor(15000);
  await page.screenshot({ path: path.join(config.repo, "screenshot_3.png") });

  // Click on "Télécharger le résultat"
  logger.info("-- Select operations to download");
  const DOWNLOAD_RESULTS_SEL =
    "#app > section > div > bux-btn-group > ul > li:nth-child(1) > bux-btn > button";
  await page.waitForSelector(DOWNLOAD_RESULTS_SEL, { visible: true });
  await page.click(DOWNLOAD_RESULTS_SEL);
  await page.waitForSelector(
    "#app > section > bux-block > bux-radio-group > div > bux-radio-button:nth-child(1) > label"
  );
  await page.screenshot({ path: path.join(config.repo, "screenshot_4.png") });

  // Click on "Excel option"
  logger.info("-- Select export format");
  await page.click(
    "#app > section > bux-block > bux-radio-group > div > bux-radio-button:nth-child(1) > label"
  );
  await page.waitFor(500);
  await page.screenshot({ path: path.join(config.repo, "screenshot_5.png") });

  // Click on "Next"
  logger.info("-- Click Next");
  await page.click(
    "#app > section > bux-btn-group > ul > li:nth-child(2) > bux-btn > a"
  );
  await page.waitFor(500);
  await page.screenshot({ path: path.join(config.repo, "screenshot_6.png") });

  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.join(".", config.repo),
  });

  // Download first document
  logger.info("-- Download document 1");
  const CC_DOWNLOAD_SEL =
    "#app > section > bux-block > bux-block > bux-file-download:nth-child(1) > span > a";
  await page.waitForSelector(CC_DOWNLOAD_SEL);
  await page.click(CC_DOWNLOAD_SEL);
  await page.waitFor(1000);

  logger.info("-- Download document 2");
  const LDD_DOWNLOAD_SEL =
    "#app > section > bux-block > bux-block > bux-file-download:nth-child(2) > span > a";
  await page.waitForSelector(LDD_DOWNLOAD_SEL);
  await page.click(LDD_DOWNLOAD_SEL);
  await page.waitFor(1000);

  logger.info("-- Download document 3");
  const LV_DOWNLOAD_SEL =
    "#app > section > bux-block > bux-block > bux-file-download:nth-child(3) > span > a";
  await page.waitForSelector(LV_DOWNLOAD_SEL);
  await page.click(LV_DOWNLOAD_SEL);
  await page.waitFor(1000);

  logger.info("-- Download document 4");
  const PEL_DOWNLOAD_SEL =
    "#app > section > bux-block > bux-block > bux-file-download:nth-child(4) > span > a";
  await page.waitForSelector(PEL_DOWNLOAD_SEL);
  await page.click(PEL_DOWNLOAD_SEL);

  logger.info("-- Extract completed");
};

module.exports = async function run() {
  await bs.setup();

  await auth(bs);

  await extract(bs);
  await bs.teardown();
};
