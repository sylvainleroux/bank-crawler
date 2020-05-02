const puppeteer = require("puppeteer");
const fs = require('fs').promises;


class BrowserSession {

    async setup() {

      let options = {
        headless: true,
        slowMo: 40,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--remote-debugging-port=9222']
      }

      /*
      if (process.env.CHROME_EXEC && process.env.CHROME_EXEC !== ''){
        options.executablePath = process.env.CHROME_EXEC
      }
      */
      
      this.browser = await puppeteer.launch(options);
      this.page = await this.browser.newPage();

     await this.browser.version().then(version => console.log(version));
    }
  
    async teardown() {
      await this.page.waitFor(5000);
      this.browser.close();
    }
  }
  
  module.exports = new BrowserSession();