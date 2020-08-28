const { format, createLogger, transports } = require("winston");
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});
const logger = createLogger({
  level: "info",
  transports: [new transports.Console()],
  format: combine(timestamp(), myFormat),
});

if (process.env.NODE_ENV !== "production") {
  logger.level = "info";
}

module.exports = logger;
