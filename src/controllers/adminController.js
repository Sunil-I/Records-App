const Transaction = require("../../lib/models/Transaction");
const Account = require("../../lib/models/Account");
const User = require("../../lib/models/User");
const Session = require("../../lib/models/Session");
const Log = require("../../lib/models/Log");
const Validation = require("../../lib/Validation");
const fs = require("fs");
const path = require("path");
const faker = require("faker");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

// Delete transaction -> Delete user -> Delete account -> Edit account -> Edit User
exports.deleteTransaction = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can delete an transaction!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to delete this transaction",
    });

  const { transaction_id } = req.params;
  const transaction = await Transaction.findOne({ transaction_id });
  if (!transaction)
    return res.render("message", {
      user: req.session,
      message: "This transaction does not exist!",
    });
  await Transaction.deleteOne({ _id: transaction._id });
  // redirect
  return res.redirect("/admin/transactions");
};

exports.deleteUser = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can delete an user!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to delete this user",
    });

  // define variables
  const { user_id } = req.params;
  // get user first
  const user = await User.findOne({ user_id });
  if (!user)
    return res.render("message", {
      user: req.session,
      message: "This user does not exist!",
    });
  // find accounts
  const acc = await Account.find({ user_id }).lean();
  // delete transactions from the accounts
  await Transaction.deleteMany({ account_id: acc.map((t) => t.account_id) });
  // delete the accounts
  await Account.deleteMany({ user_id });
  // delete the user
  await User.deleteOne({ _id: user._id });
  if (user.id == req.session.user_id) await req.session.destroy();
  // redirect
  return res.redirect("/admin/users");
};

exports.deleteAccount = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can delete an account!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to delete this account",
    });

  // define variables
  const { account_id } = req.params;
  // get account first
  const account = await Account.findOne({ account_id });
  if (!account)
    return res.render("message", {
      user: req.session,
      message: "This account does not exist!",
    });
  await Account.deleteOne({ _id: account._id });
  // redirect
  return res.redirect("/admin/accounts");
};

exports.editAccount = async (req, res) => {
  const { name, accountno, sortcode, balance, account_id } = req.body;
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    if (
      typeof req.session.user_id === "undefined" ||
      typeof req.session.user_id === "null"
    )
      return res.status(400).json({
        success: false,
        message: "Only authenticated users view use this endpoint!",
      });

  if (!req.session.isAdmin)
    return res.status(400).json({
      success: false,
      message: "Only admin users view use this endpoint!",
    });

  const body_validation = Validation.body([
    {
      name: "account id",
      value: account_id,
    },
    {
      name: "name",
      value: name,
    },
    {
      name: "account number",
      value: accountno,
    },
    {
      name: "sort code",
      value: sortcode,
    },
    {
      name: "balance",
      value: balance,
    },
  ]);
  if (body_validation.length)
    return res.status(400).json({
      success: false,
      message: `${body_validation[0]} was not sent!`,
      type: body_validation[0],
    });
  // check input
  const validation_fields = Validation.validate([
    {
      name: "name",
      value: name,
      type: "name",
    },
    {
      name: "account number",
      value: accountno,
      type: "numberLong",
    },
    {
      name: "sort code",
      value: sortcode,
      type: "numberShort",
    },
    {
      name: "balance",
      value: balance,
      type: "float",
    },
  ]);
  // if validation failed
  if (validation_fields.length)
    return res.status(400).json({
      success: false,
      message: validation_fields[0].message,
      type: validation_fields[0].name,
    });

  const query = await Account.findOne({ account_id });
  // if account does not exist
  if (!query)
    return res.status(400).json({
      success: false,
      message: "The account does not exist!",
      type: "account",
    });
  // update details
  if (query) {
    query.name = name;
    query.accountno = accountno;
    query.sortcode = sortcode;
    query.balance = balance;
    await query.save();
    return res.status(200).json({ success: true, message: "Updated account!" });
  }
};

exports.updateUser = async (req, res) => {
  // define variables
  const { user_id, email, name, isAdmin, isVerified } = req.body;
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.status(400).json({
      success: false,
      message: "Only authenticated users view use this endpoint!",
    });

  if (!req.session.isAdmin)
    return res.status(400).json({
      success: false,
      message: "Only admin users view use this endpoint!",
    });
  // check if we recieved valid data
  const body_validation = Validation.body([
    {
      name: "name",
      value: name,
    },
    {
      name: "email",
      value: email,
    },
    {
      name: "isAdmin",
      value: isAdmin,
    },
    {
      name: "isVerified",
      value: isVerified,
    },
  ]);
  if (body_validation.length)
    return res.status(400).json({
      success: false,
      message: `${body_validation[0]} was not sent.`,
    });

  // validate data sent
  const validation_fields = Validation.validate([
    {
      name: "name",
      value: name,
      type: "name",
    },
    {
      name: "email",
      value: email,
      type: "email",
    },
  ]);
  // if validation failed
  if (validation_fields.length)
    return res.status(400).json({
      success: false,
      message: validation_fields[0].message,
      type: validation_fields[0].name,
    });

  // grab user
  const user = await User.findOne({ user_id });
  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Could not find user!", type: "user" });
  user.email = email;
  user.name = name;
  user.isAdmin = isAdmin;
  user.verified = isVerified;
  await user.save();
  if (user.user_id === req.session.user_id) {
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.verified = user.verified;
    req.session.created_at = user.createdAt;
    req.session.isAdmin = user.isAdmin;
  }
  return res
    .status(200)
    .json({ success: true, message: "Updated user details." });
};

exports.wipeTransactions = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can wipe transactions!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to wipe transactions",
    });

  await Transaction.deleteMany({});
  // redirect
  return res.redirect("/admin/manage");
};

exports.wipeAccounts = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can wipe accounts!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to wipe accounts!",
    });

  await Account.deleteMany({});
  await Transaction.deleteMany({});
  // redirect
  return res.redirect("/admin/manage");
};

exports.wipeUsers = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can wipe users!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to wipe users!",
    });

  await User.deleteMany({});
  await Account.deleteMany({});
  await Transaction.deleteMany({});
  await Session.deleteMany({});
  await req.session.destroy();
  // redirect
  return res.redirect("/admin/manage");
};

exports.wipeSessions = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can wipe sessions!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to wipe sessions!",
    });

  await Session.deleteMany({});
  // redirect
  return res.redirect("/admin/manage");
};

exports.wipeLogs = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can wipe logs!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to wipe logs!",
    });

  await Log.deleteMany({});
  // redirect
  return res.redirect("/admin/manage");
};

exports.exportUsers = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can export users!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to export users!",
    });

  const users = await User.find({}).lean();

  const file_name = `users-export-${Date.now()}.json`;
  const file_path = path.join(__dirname, "..", "..", file_name);
  fs.writeFileSync(file_path, JSON.stringify(users));
  res.setHeader("Content-disposition", `attachment; filename=${file_name}`);
  res.sendFile(file_path, function (err) {
    if (err) {
      next(err);
    } else {
      fs.unlink(file_name, () => {});
    }
  });
};

exports.exportTransactions = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can export transactions!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to export transactions!",
    });

  const transactions = await Transaction.find({}).lean();

  const file_name = `transactions-export-${Date.now()}.json`;
  const file_path = path.join(__dirname, "..", "..", file_name);
  fs.writeFileSync(file_path, JSON.stringify(transactions));
  res.setHeader("Content-disposition", `attachment; filename=${file_name}`);
  res.sendFile(file_path, function (err) {
    if (err) {
      next(err);
    } else {
      fs.unlink(file_name, () => {});
    }
  });
};
exports.exportAccounts = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can export accounts!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to wipe accounts!",
    });

  const accounts = await Account.find({}).lean();

  const file_name = `accounts-export-${Date.now()}.json`;
  const file_path = path.join(__dirname, "..", "..", file_name);
  fs.writeFileSync(file_path, JSON.stringify(accounts));
  res.setHeader("Content-disposition", `attachment; filename=${file_name}`);
  res.sendFile(file_path, function (err) {
    if (err) {
      next(err);
    } else {
      fs.unlink(file_name, () => {});
    }
  });
};

exports.exportSessions = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can export sessions!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to export sessions!",
    });

  const sessions = await Session.find({}).lean();

  const file_name = `sessions-export-${Date.now()}.json`;
  const file_path = path.join(__dirname, "..", "..", file_name);
  fs.writeFileSync(file_path, JSON.stringify(sessions));
  res.setHeader("Content-disposition", `attachment; filename=${file_name}`);
  res.sendFile(file_path, function (err) {
    if (err) {
      next(err);
    } else {
      fs.unlink(file_name, () => {});
    }
  });
};

exports.exportLogs = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can export logs!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to export logs!",
    });

  const logs = await Log.find({}).lean();

  const file_name = `logs-export-${Date.now()}.json`;
  const file_path = path.join(__dirname, "..", "..", file_name);
  fs.writeFileSync(file_path, JSON.stringify(logs));
  res.setHeader("Content-disposition", `attachment; filename=${file_name}`);
  res.sendFile(file_path, function (err) {
    if (err) {
      next(err);
    } else {
      fs.unlink(file_name, () => {});
    }
  });
};

exports.generateAccounts = async (req, res) => {
  const { execSync } = require("child_process");
  const env =
    process.env.NODE_ENV === "production" ? "production" : "development";
  const command = "NODE_ENV=" + env + " node cli/multiAccounts.js 5";
  console.log("Executing command " + command);
  execSync(command, (error) => {
    if (error) {
      console.error(`error: ${error.message}`);
      console._error(error);
      return;
    }
  });
  return res.redirect("/admin/manage");
};

exports.generateUsers = async (req, res) => {
  const { execSync } = require("child_process");
  const env =
    process.env.NODE_ENV === "production" ? "production" : "development";
  const command = "NODE_ENV=" + env + " node cli/users.js 10";
  console.log("Executing command " + command);
  execSync(command, (error) => {
    if (error) {
      console.error(`error: ${error.message}`);
      console._error(error);
      return;
    }
  });
  return res.redirect("/admin/manage");
};

exports.generateTransactions = async (req, res) => {
  const { execSync } = require("child_process");
  const env =
    process.env.NODE_ENV === "production" ? "production" : "development";
  const command = "NODE_ENV=" + env + " node cli/multiTransactions.js 5";
  console.log("Executing command " + command);
  execSync(command, (error) => {
    if (error) {
      console.error(`error: ${error.message}`);
      console._error(error);
      return;
    }
  });
  return res.redirect("/admin/manage");
};
