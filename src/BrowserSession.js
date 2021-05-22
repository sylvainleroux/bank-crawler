const puppeteer = require("puppeteer"),
  fs = require("fs").promises,
  logger = require("./logger"),
  config = require("./config");

class BrowserSession {
  async setup() {
    let options = {
      headless: true,
      slowMo: 40,
    };

    if (config.chrome_executable && config.chrome_executable !== "") {
      options.executablePath = config.chrome_executable;
    }

    logger.info("Configure browser with options:", { options });

    this.browser = await puppeteer.launch(options);
    this.page = await this.browser.newPage();

    await this.page.setViewport({ width: 850, height: 1000 });

    await this.browser
      .version()
      .then((version) => logger.info(`-- Browser version: ${version}`));
  }

  async teardown() {
    if (config.debug) {
      logger.info("Do not teardown browser in debug mode");
      return;
    }

    logger.info("Tear down browser");
    await this.page.waitFor(5000);
    this.browser.close();
    logger.info("-- Browser terminated");
  }
}

module.exports = new BrowserSession();
