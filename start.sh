#!/usr/bin/env bash

set -e

exec env QT_QPA_PLATFORM="offscreen" env NODE_ENV=production /usr/share/bank-crawler/app/cron.js