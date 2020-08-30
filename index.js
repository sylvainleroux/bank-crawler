#!/usr/bin/env node

const cron = require("node-cron");
const config = require("./src/config");
const logger = require("./src/logger");

const main = async () => {
  try {
    logger.info("Start Extract");
    await require("./src/cmb/extract")();
    await require("./src/cmb/cmbLoad.js")();
    logger.info("task completed");
  } catch (e){
    console.error("Exception caught", e.stack);
  }
};

if (config.debug) {
  logger.info(`Debug mode enabled: ${config.debug}`);
  (async () => main())();
} else {
  if (!cron.validate(config.cron_expression)) {
    logger.error(`Invalid cron expression: ${config.cron_expression}`);
    process.exit(1);
  }
  logger.info(`Start Crawler with cron expression: ${config.cron_expression}`);
  cron.schedule(config.cron_expression, () => {
    (async () => main())();
  });
}
