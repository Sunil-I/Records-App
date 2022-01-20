const Transaction = require("../../lib/models/Transaction");
const Account = require("../../lib/models/Account");
const User = require("../../lib/models/User");
const Validation = require("../../lib/Validation");

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

  // define variables
  const { transaction_id } = req.params;
  // get transaction first
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
      message: "You do not have permission to delete wipe transactions",
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
  // redirect
  req.session.destroy()
  return res.redirect("/admin/manage");
};
