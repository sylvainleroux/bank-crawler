#!/usr/bin/env node

const cmbExport = require("./cmbExport");
var cron = require("node-cron");

const cronRule = "0 * * * *";

console.log("Starting bank-crawnler with cron rule " + cronRule);

cron.schedule(cronRule, () => {
  console.log("Launch CMB export");
  (async function() {
    try {
      await cmbExport();
    } catch (e) {
      console.log(e);
    }
  })();
});
