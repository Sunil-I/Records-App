const mongoose = require("mongoose");
const { transports, createLogger, format } = require("winston");
const Sentry = require("@sentry/node");
exports.db = async () => {
  mongoose.connection.on("error", (err) => {
    console.error("Database Error: ");
    console._error(err);
    process.exit();
  });

  mongoose.connection.on("connected", () => {
    mongoose.connection.readyState == 1
      ? console.log("Connected to database")
      : console.error("Not connected to database");
  });

  return await mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
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

exports.sentry = () => {
  if (process.env.SENTRY_DSN) Sentry.init({ dsn: process.env.SENTRY_DSN });
  console.sentry = function (e) {
    if ((process.env.NODE_ENV = "production" && process.env.SENTRY_DSN)) {
      console.error(e.message);
      console._error(e.stack);
      Sentry.captureException(e);
    } else {
      console.log(
        "Error sent to console, app is not running in production or DSN is not set!"
      );
      console.error(e.message);
      console._error(e.stack);
    }
  };
};

exports.jsonParseHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error(err.message);
    console._error(err);
    return res.status(400).json({
      message: "Invalid JSON",
      error: "SERVER_SIDE_ERROR",
    });
  }
  next();
};
