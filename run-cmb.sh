#!/bin/bash

rm -Rf tmp/*

phantomjs --cookies-file=tmp/cmb-cookies scripts/cmb.js

cat tmp/cmb-files | while read line; do
	eval $line;
done
