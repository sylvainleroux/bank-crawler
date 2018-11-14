#!/usr/bin/env bash


rm *.deb

./node_modules/.bin/node-deb -- index.js cron.js cmbImport.js src start.sh 