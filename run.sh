#!/bin/bash

rm -Rf step_*
rm -f frameContent
rm -f download-url

phantomjs test.js
export URL=`cat download-url`
export DATE=$(date +"%Y%m%d%H%m%s")
export FILENAME="/Users/sleroux/Downloads/CyberPlus_OP_$DATE.csv"
curl -s -L -b cookies -c cookies $URL -o "$FILENAME"