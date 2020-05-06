#!/usr/bin/env node

const cron = require("node-cron"),
  config = require("./src/config"),
  logger = require("./src/logger");

if (!cron.validate(config.cron_expression)) {
  logger.error(`Invalid cron expression: ${config.cron_expression}`);
  process.exit(1);
}

logger.info(`Start Crawler with cron expression: ${config.cron_expression}`);

cron.schedule(config.cron_expression, () => {
  (async () => {
    logger.info("Start Extract");
    await require("./src/cmb/extract")();
    await require("./src/cmb/cmbLoad.js")();
    logger.info("task completed");
  })();
});
