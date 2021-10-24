const mongoose = require("mongoose");
const { transports, createLogger, format } = require("winston");

exports.db = async () => {
  return await mongoose.connect(
    process.env.MONGODB_CONNECTION_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    () => console.log("Connected to database")
  );
};

exports.logging = () => {
  // where logs are stored
  const filePath =
    process.env.NODE_ENV === "production" ? "logs/app.log" : "logs/app-dev.log";
  // define format
  const logFormat = format.printf(
    (info) => `[${info.timestamp}] [${info.level}] : ${info.message}`
  );
  // create logger
  const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.prettyPrint()
    ),
    transports: [
      new transports.Console({
        format: format.combine(format.colorize(), logFormat),
      }),
      new transports.File({ filename: filePath }),
    ],
  });

  // allow raw methods to still be accessible
  console._log = console.log;
  console._info = console.info;
  console._warn = console.warn;
  console._error = console.error;
  console._debug = console.debug;
  // change main logging methods to use new logger
  console.log = (...args) => logger.info.call(logger, ...args);
  console.info = (...args) => logger.info.call(logger, ...args);
  console.warn = (...args) => logger.warn.call(logger, ...args);
  console.error = (...args) => logger.error.call(logger, ...args);
  console.debug = (...args) => logger.debug.call(logger, ...args);
};
