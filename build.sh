#!/usr/bin/env bash


rm *.deb

./node_modules/.bin/node-deb -- index.js cron.js cmbExport.js utils steps start.sh