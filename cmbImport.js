#!/usr/bin/env node

const cmbLoad = require("./src/cmb/load/cmbLoad");

try {
  cmbLoad();
} catch (e) {
  console.log(e);
}
