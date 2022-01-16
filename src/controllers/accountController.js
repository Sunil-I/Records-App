const Account = require("../../lib/models/Account");
const Transaction = require("../../lib/models/Transaction");
const Validation = require("../../lib/Validation");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);
exports.create = async (req, res) => {
  const { user_id } = req.session;
  const { name, accountno, sortcode, balance } = req.body;
  //  if user is not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.status(403).json({
      success: false,
      message: "Only authenticated users can create an account!",
    });
  // if variable is not sent
  const body_validation = Validation.body([
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
      type: "numberLong",
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
  let account_id = nanoid();
  const account = new Account({
    account_id: account_id,
    user_id: user_id,
    name: name,
    balance: balance,
    accountno: accountno,
    sortcode: sortcode,
  });
  await account.save();
  return res.status(200).send({ success: true, message: "Account created!" });
};

exports.delete = async (req, res) => {
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can delete an account!",
    });
  const { account_id } = req.params;
  const { user_id } = req.session;
  const query = await Account.findOne({ account_id });
  // account doesn't exist
  if (!query)
    return res.render("message", {
      user: req.session,
      message: "The account does not exist!",
    });
  // checking if logged in user owns account
  if (query.user_id !== user_id)
    return res.render("message", {
      user: req.session,
      message: "Only the account owner can delete this account!",
    });
  // delete account
  if (query) await Account.deleteOne({ _id: query._id });
  // delete transactions relating to account
  if (query) await Transaction.deleteMany({ account_id: account_id });
  return res.redirect("/accounts");
};

exports.updateAccount = async (req, res) => {
  const { user_id } = req.session;
  const { name, accountno, sortcode, balance, account_id } = req.body;
  // if user is not logged in
  if (typeof user_id === "undefined" || typeof user_id === "null")
    return res.status(403).json({
      success: false,
      message: "Only authentined users can create an account!",
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
      name: "account id",
      value: account_id,
      type: "number",
    },
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
      type: "numberLong",
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
  // checking if account owner is the logged in user
  if (query.user_id !== user_id)
    return res.status(403).json({
      success: false,
      message: "Only the account owner can edit this account!",
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