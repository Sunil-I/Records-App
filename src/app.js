// define express
const express = require("express");
const app = express();
// define sentry
const sentry = require("@sentry/node");
// define environment values
const { PORT, BASE_URL } = process.env;
// initialization functions
const init = require("../lib/Initialization");
// get controllers
const userController = require("./controllers/userController");
const homeController = require("./controllers/homeController");
// sentry logging
if ((NODE_ENV = "production")) app.use(sentry.Handlers.requestHandler());
// set hide express is running
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
// routes
app.get("/", homeController.getHomeView)
app.post("/register", userController.create);
app.get("/login", userController.getLoginView);
app.post("/login", userController.login);

// bind to port and run functions
app.listen(PORT, "127.0.0.1", () => {
  init.logging();
  init.db();
  init.sentry();
  console.log(`Express server started at ${BASE_URL}`);
});
