#!/usr/bin/env node

const cmbExtract = require("./src/cmb/extract/cmbExtract");
const cmbLoad = require("./src/cmb/load/cmbLoad");
const config = require("./src/utils/config");

var cron = require("node-cron");

const cronRule = config.getValue("cron", "0 * * * *");

console.log("Starting bank-crawnler with cron rule " + cronRule);

cron.schedule(cronRule, () => {
  (async function() {
    try {
      console.log("Launch CMB extract");
      await cmbExtract();
      console.log("Launch CMB load");
      await cmbLoad();
    } catch (e) {
      console.log(e);
    }
  })();
});
