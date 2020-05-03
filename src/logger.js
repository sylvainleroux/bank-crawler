const winston = require("winston");
const transport = new winston.transports.Console();
const logger = winston.createLogger({
  level: "info",
  transports: [transport],
  format: winston.format.simple(),
});

if (process.env.NODE_ENV !== "production") {
  logger.level = "info";
}

module.exports = logger;
