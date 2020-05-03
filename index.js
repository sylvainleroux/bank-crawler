#!/usr/bin/env node

(async() => {
    await require('./src/cmb/extract')();
    await require('./src/cmb/cmbLoad.js')();
})();
