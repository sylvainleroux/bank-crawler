#!/usr/bin/env bash

set -e

QT_QPA_PLATFORM="offscreen" NODE_ENV=production /usr/share/bank-crawler/app/cron.js