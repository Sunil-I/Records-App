const express = require("express");
const app = express();
const sentry = require("@sentry/node");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const start = require("../lib/Initialization");
const { PORT, BASE_URL, IP } = process.env;

const viewController = require("./controllers/viewController");
const userController = require("./controllers/userController");
const accountController = require("./controllers/accountController");
const transactionController = require("./controllers/transactionController");
const visualizationsController = require("./controllers/visualizationsController");
const adminController = require("./controllers/adminController");
const adminViewController = require("./controllers/adminViewController");

// only use sentry for request handling in production
if ((NODE_ENV = "production")) app.use(sentry.Handlers.requestHandler());
// protect app from common scrapers
app.disable("x-powered-by");
// set view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// allows express to recieve JSON and HTML form data via req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// handle invalid JSON
app.use(start.jsonParseHandler);
// static assets
app.use(express.static(__dirname + "/public"));
// setup sessions to last for 12 hours
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
app.get("/refresh", userController.refresh);
// forget password
app.get("/forgot-password", viewController.forget);
app.post("/forget-password", userController.findResetEmail);
app.get("/reset-password/:token", viewController.reset);
app.post("/reset-password", userController.reset);
// verify view
app.get("/verify/:hash", viewController.verify);
// account views
app.get("/accounts/", viewController.accounts);
app.get("/accounts/new", viewController.createAccount);
app.get("/accounts/edit/:account_id", viewController.editAccount);
app.get("/accounts/view/:account_id", viewController.viewAccount);
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
// summary
app.get("/summary/transactions", visualizationsController.transactions);
app.get("/summary/accounts", visualizationsController.accounts);
// admin
app.get("/admin", adminViewController.dashboard);
// admin transactions
app.get("/admin/transactions", adminViewController.transactions);
app.get(
  "/admin/transactions/delete/:transaction_id",
  adminController.deleteTransaction
);
// admin accounts
app.get("/admin/accounts", adminViewController.accounts);
app.get("/admin/accounts/view/:account_id", adminViewController.viewAccount);
app.get("/admin/accounts/edit/:account_id", adminViewController.editAccount);
app.get("/admin/accounts/delete/:account_id", adminController.deleteAccount);
app.post("/admin/accounts/edit", adminController.editAccount);
// admin users
app.get("/admin/users", adminViewController.users);
app.get("/admin/users/view/:user_id", adminViewController.viewUser);
app.get("/admin/users/edit/:user_id", adminViewController.editUser);
app.get("/admin/users/delete/:user_id", adminController.deleteUser);
app.post("/admin/users/edit", adminController.updateUser);
// admin data
app.get("/admin/manage", adminViewController.manage);
// delete
app.get("/admin/data/delete/users", adminController.wipeUsers);
app.get("/admin/data/delete/transactions", adminController.wipeTransactions);
app.get("/admin/data/delete/accounts", adminController.wipeAccounts);
app.get("/admin/data/delete/sessions", adminController.wipeSessions);
app.get("/admin/data/delete/logs", adminController.wipeLogs);
// export
app.get("/admin/data/export/users", adminController.exportUsers);
app.get("/admin/data/export/transactions", adminController.exportTransactions);
app.get("/admin/data/export/accounts", adminController.exportAccounts);
app.get("/admin/data/export/sessions", adminController.exportSessions);
app.get("/admin/data/export/logs", adminController.exportLogs);
// generate
app.get("/admin/data/generate/users", adminController.generateUsers);
app.get(
  "/admin/data/generate/transactions",
  adminController.generateTransactions
);
app.get("/admin/data/generate/accounts", adminController.generateAccounts);
// logs
app.get("/admin/logs", adminViewController.logs);
// handle errors
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Unknown error!",
    type: "SERVER_SIDE_ERROR",
  });
});

// bind to port and run functions
app.listen(PORT || 5000, IP || "0.0.0.0", () => {
  start.logging();
  start.db();
  start.sentry();
  console.log(`Express server started at ${BASE_URL}`);
});
