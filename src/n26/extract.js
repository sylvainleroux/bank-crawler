const bs = require("../BrowserSession"),
config = require("../config"),
logger = require("../logger"),
path = require("path"),
 fs = require('fs').promises;

const auth = async function (bs) {
    logger.info("Start authentication");
    const page = bs.page;

    const cookiesString = await fs.readFile(path.join(config.repo, "./cookies.json"));
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
    

    await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
      );
    await page.goto("https://app.n26.com/login", {
        waitUntil: "networkidle2",
    });
    await page.screenshot({ path: path.join(config.repo, "screenshot_2.png") });
    logger.info("-- set login");
    await page.waitForSelector("#email");
    await page.type("#email", config.n26.login  );
    await page.screenshot({ path: path.join(config.repo, "screenshot_3.png") });
    logger.info("-- set password");
    await page.waitForSelector("#password");
    await page.type("#password", config.n26.password);
    logger.info("-- validate form");
    await page.click(
      "#root > main > div > div > div > div > div > form > button"
    );
    await page.waitForNavigation();
    logger.info("Authentication completed");

    const writeCookies = await page.cookies();

    

    await fs.writeFile(path.join(config.repo, "./cookies.json"), JSON.stringify(writeCookies, null, 2));

}

module.exports = async function run() {
    await bs.setup();
    try {
        await auth(bs);
    } catch(e){
        console.log(e.stack);
    } finally {
        await bs.teardown();
    }
}