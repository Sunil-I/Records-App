// define express package
const express = require("express");
const app = express();
// define sentry package
const sentry = require("@sentry/node");
// define session packages
const session = require("express-session");
const MongoStore = require("connect-mongo");
// define environment values
const { PORT, BASE_URL } = process.env;
// initialization functions
const init = require("../lib/Initialization");
// define controllers
const userController = require("./controllers/userController");
const homeController = require("./controllers/homeController");
// enable sentry logging for production only
if ((NODE_ENV = "production")) app.use(sentry.Handlers.requestHandler());
// hide express is running from scrapers
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "<3");
  next();
});
// set view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// allow the use of req.body with JSON post + html forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// handle invalid JSON
app.use(init.jsonParseHandler);
// static assets
app.use(express.static(__dirname + "/public"));
// setup session for 12 hours
app.use(
  session({
    secret: process.env.SALT,
    saveUninitialized: false,
    resave: true,
    cookie: { maxAge: 43200000 },
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_CONNECTION_URL }),
  })
);

// routes

// home page
app.get("/", homeController.getHomeView);
// register
app.post("/register", userController.create);
// login
app.get("/login", userController.getLoginView);
app.post("/login", userController.login);

// bind to port and run functions
app.listen(PORT, "127.0.0.1", () => {
  init.logging();
  init.db();
  init.sentry();
  console.log(`Express server started at ${BASE_URL}`);
});
