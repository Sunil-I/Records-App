const express = require("express");
const app = express();
// define sentry package
const sentry = require("@sentry/node");
// define session packages
const session = require("express-session");
const MongoStore = require("connect-mongo");
// define environment values
const { PORT, BASE_URL, IP } = process.env;
// initialization functions
const init = require("../lib/Initialization");
// define controllers
const viewController = require("./controllers/viewController");
const userController = require("./controllers/userController");
const accountController = require("./controllers/accountController");
const transactionController = require("./controllers/transactionController");
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

// home page
app.get("/", viewController.home);
// register
app.get("/register", viewController.register);
app.post("/register", userController.create);
// login
app.get("/login", viewController.login);
app.post("/login", userController.login);
// close account
app.get("/close", viewController.close);
app.post("/close", userController.delete);
// update account
app.get("/update", viewController.update);
app.post("/update", userController.update);
// logout
app.get("/logout", userController.logout);
// profile
app.get("/profile", viewController.profile);
// verify view
app.get("/verify/:hash", viewController.verify);
// account views
app.get("/accounts/", viewController.accounts);
app.get("/accounts/new", viewController.createAccount);
app.get("/accounts/edit/:account_id", viewController.editAccount);
// account action endpoints
app.get("/accounts/delete/:account_id", accountController.delete);
app.post("/accounts/new", accountController.create);
app.post("/accounts/edit", accountController.updateAccount);
// transactions views
app.get("/transactions", viewController.transactions);
app.get("/transactions/new", viewController.createTransaction);
// transactions action endpoints
app.get("/transactions/delete/:transaction_id", transactionController.delete);
app.post("/transactions/new", transactionController.create);
// bind to port and run functions
app.listen(PORT || 5000, IP || "0.0.0.0", () => {
  init.logging();
  init.db();
  init.sentry();
  console.log(`Express server started at ${BASE_URL}`);
});
