const puppeteer = require("puppeteer");
const fs = require('fs').promises;


class BrowserSession {

    async setup() {
      this.browser = await puppeteer.launch(
        {
          executablePath: '/usr/bin/google-chrome-unstable',
          headless: true,
          slowMo: 40,
          devtools: false,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
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