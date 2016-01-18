#!/bin/bash

export PATH=$PATH:/usr/local/Cellar/node/4.2.1/lib/node_modules/phantomjs/lib/phantom/bin

rm -Rf tmp/*

phantomjs --cookies-file=tmp/cmb-cookies scripts/cmb.js

cat tmp/cmb-files | while read line; do
	eval $line;
done
