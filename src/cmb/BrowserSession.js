const puppeteer = require("puppeteer");
const fs = require('fs').promises;


class BrowserSession {

    async setup() {
      this.browser = await puppeteer.launch(
         process.env.DEBUG
          ? {
              headless: true,
              slowMo: 40,
              devtools: true,
              args: ['--remote-debugging-port=9222'],
            }
          : {
            headless: true,
            slowMo: 40,
            devtools: false
          }
      );
      this.page = await this.browser.newPage();
    }
  
    async teardown() {
      await this.page.waitFor(5000);
      this.browser.close();
    }
  }
  
  module.exports = new BrowserSession();