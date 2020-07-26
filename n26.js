#!/usr/bin/env node

const cron = require("node-cron"),
  config = require("./src/config"),
  logger = require("./src/logger");


config.cron_expression = "*/5 * * * *";

if (!cron.validate(config.cron_expression)) {
  logger.error(`Invalid cron expression: ${config.cron_expression}`);
  process.exit(1);
}

logger.info(`Start Crawler with cron expression: ${config.cron_expression}`);

cron.schedule(config.cron_expression, () => {
  (async () => {
    logger.info("Start Extract");
    await require("./src/n26/extract")();
  
    logger.info("task completed");
  })();
});
