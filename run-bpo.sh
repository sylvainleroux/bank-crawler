#!/bin/bash

rm -Rf tmp/*


phantomjs scripts/bpo.js
export URL=`cat tmp/bpo-download-url`
export DATE=$(date +"%Y%m%d%H%m%s")
export FILENAME="/Users/sleroux/Downloads/CyberPlus_OP_$DATE.csv"
curl -s -L -b tmp/bpo-cookies -c tmp/bpo-cookies $URL -o "$FILENAME"