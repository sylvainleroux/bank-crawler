#!/usr/bin/env bash


rm *.deb

./node_modules/.bin/node-deb -- index.js cron.js run_cmb_extract.js src run_cmb_load.js start.sh