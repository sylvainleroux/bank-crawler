#!/usr/bin/env node

const cmbExtract = require("./src/cmb/extract/cmbExport");
const cmbLoad = require("./src/cmb/load/cmbLoad");

(async function() {
  try {
    await cmbExtract();
    await cmbLoad();
  } catch (e) {
    console.log(e);
  }
})();
