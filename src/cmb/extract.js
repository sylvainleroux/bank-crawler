const bs = require("./BrowserSession"),
  config = require("./config"),
  path = require("path");

const auth = async function(bs){

    const page = bs.page;
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36')
    await page.goto("https://mon.cmb.fr/auth/login", { waitUntil: "networkidle2" });
    await page.waitForSelector("#userLogin");
    await page.type('#userLogin', config.login);
    await page.click("#auth-c_1 > button");
    await page.waitForSelector("#userPassword");
    await page.type("#userPassword", config.password);
    await page.click("#formLogin > div.c-auth__dropdown.ng-scope > div:nth-child(2) > input");
  
} 

const extract = async function(bs) {
    const page = bs.page;
    await page.waitForNavigation();
    await page.goto("https://mon.cmb.fr/transactions");
  
    // Click on "Recherche"
    await page.waitForSelector("#searchButton > button", { visible: true });
    await page.screenshot({ path: path.join(config.repo, "screenshot_1.png") });
    await page.waitFor(5000);
    await page.screenshot({ path: path.join(config.repo, "screenshot_2.png") });
    await page.click("#searchButton > button");
  
    // Wait for data
    await page.waitFor(15000);
    await page.screenshot({ path: path.join(config.repo, "screenshot_3.png") });
  
    // Click on "Télécharger le résultat"
    const DOWNLOAD_RESULTS_SEL =
      "#app > section > div > bux-btn-group > ul > li:nth-child(1) > bux-btn > button";
    await page.waitForSelector(DOWNLOAD_RESULTS_SEL, { visible: true });
    await page.click(DOWNLOAD_RESULTS_SEL);
    await page.waitForSelector(
      "#app > section > bux-block > bux-radio-group > div > bux-radio-button:nth-child(1) > label"
    );
    await page.screenshot({ path: path.join(config.repo, "screenshot_4.png") });
  
    // Click on "Excel option"
    await page.click(
      "#app > section > bux-block > bux-radio-group > div > bux-radio-button:nth-child(1) > label"
    );
    await page.waitFor(500);
    await page.screenshot({ path: path.join(config.repo, "screenshot_5.png") });
  
    // Click on "Next"
    await page.click(
      "#app > section > bux-btn-group > ul > li:nth-child(2) > bux-btn > a"
    );
    await page.waitFor(500);
    await page.screenshot({ path: path.join(config.repo, "screenshot_6.png") });
  
    await page._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: path.join(".", config.repo)
    });
  
    // Download first document
    const CC_DOWNLOAD_SEL =
      "#app > section > bux-block > bux-block > bux-file-download:nth-child(1) > span > a";
    await page.waitForSelector(CC_DOWNLOAD_SEL);
    await page.click(CC_DOWNLOAD_SEL);
  
    await page.waitFor(1000);
    const LDD_DOWNLOAD_SEL =
      "#app > section > bux-block > bux-block > bux-file-download:nth-child(2) > span > a";
    await page.waitForSelector(LDD_DOWNLOAD_SEL);
    await page.click(LDD_DOWNLOAD_SEL);
  
    await page.waitFor(1000);
    const LV_DOWNLOAD_SEL =
      "#app > section > bux-block > bux-block > bux-file-download:nth-child(3) > span > a";
    await page.waitForSelector(LV_DOWNLOAD_SEL);
    await page.click(LV_DOWNLOAD_SEL);
  
    await page.waitFor(1000);
    const PEL_DOWNLOAD_SEL =
      "#app > section > bux-block > bux-block > bux-file-download:nth-child(4) > span > a";
    await page.waitForSelector(PEL_DOWNLOAD_SEL);
    await page.click(PEL_DOWNLOAD_SEL);
  };
  


module.exports = async function run() {
    console.log("Start CMB extract and load")
    await bs.setup();
    await auth(bs);
    await extract(bs);
    await bs.teardown();
}

