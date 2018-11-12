#!/usr/bin/env node

const cmbExport = require("./cmbExport");

(async function() {
  try {
    await cmbExport();
  } catch (e) {
    console.log(e);
  }
})();
