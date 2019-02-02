#!/usr/bin/env node

const cmbExtract = require("./src/cmb/extract/cmbExtract");

(async function() {
  try {
    await cmbExtract();
  } catch (e) {
    console.log(e);
  }
})();
