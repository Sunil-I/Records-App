const Account = require("../../lib/models/Account");
const Validation = require("../../lib/Validation");

exports.create = async (req, res) => {
  const { user_id } = req.session;
  const { name, accountno, sortcode, balance } = req.body;
  // if user is not logged in
  if (!user_id)
    return res.status(403).json({
      success: false,
      message: "Only authenticated users can create an account!",
    });
  // if variable id not sent
  if (!name)
    return res.status(400).json({
      success: false,
      message: "Please give a name!",
      type: "name",
    });

  if (!accountno)
    return res.status(400).json({
      success: false,
      message: "Please give an account number!",
      type: "accountno",
    });
  if (!sortcode)
    return res.status(400).json({
      success: false,
      message: "Please give a sort code.",
      type: "sortcode",
    });
  if (!balance)
    return res.status(400).json({
      success: false,
      message: "Please give a balance.",
      type: "balance",
    });
  // check input
  const validation_name = Validation.name(name);
  const validation_accountNo = Validation.numberLong(accountno);
  const validation_sortCode = Validation.numberLong(sortcode);
  const validation_balance = Validation.float(balance);
  // if validation failed
  if (!validation_name.valid)
    return res
      .status(400)
      .json({ success: false, message: validation_name.reason, type: "name" });
  if (!validation_accountNo.valid)
    return res.status(400).json({
      success: false,
      message: validation_accountNo.reason,
      type: "accountno",
    });
  if (!validation_sortCode.valid)
    return res.status(400).json({
      success: false,
      message: validation_sortCode.reason,
      type: "sortcode",
    });
  if (!validation_balance.valid)
    return res.status(400).json({
      success: false,
      message: validation_balance.reason,
      type: "balance",
    });
  // count accounts
  const count = await Account.find({}).countDocuments();
  const account = new Account({
    account_id: count + 1,
    user_id: user_id,
    name: name,
    balance: balance,
    accountno: accountno,
    sortcode: sortcode,
  });
  await account.save();
  return res.status(200).send({ success: true, message: "Account created!" });
};

exports.getAccountCreateView = async (req, res) => {
  if (!req.session.user_id)
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can create an account!",
    });
  return res.render("create/account", { user: req.session });
};

exports.getAccountView = async (req, res) => {
  const { user_id } = req.session;
  let { page } = req.query;

  if (!user_id)
    return res.render("message", {
      message: "Only authenticated users can get accounts!",
      user: req.session,
    });
  // 10 results per page
  const perPage = 10;
  // parse page input and remove anything thats not a number
  if (page) page = parseInt(page.toString().replace(/[^0-9]/g, ""));
  // checks for page num and how many results
  if (!page) page = 1;
  // find data
  const accounts = await Account.find({ user_id: user_id })
    .skip(perPage * page - perPage)
    .limit(10);
  // count number of accounts we have for user
  const count = await Account.find({ user_id: user_id }).count();
  // calculate number of pages needed
  const numberOfPages = Math.ceil(count / perPage);
  // render page
  return res.render("accounts", {
    user: req.session,
    accounts: accounts,
    pages: numberOfPages,
    current: page,
  });
};

exports.deleteAccount = async (req, res) => {
  if (!req.session.user_id)
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can delete an account!",
    });
  const { account_id } = req.params;
  const { user_id } = req.session;
  const query = await Account.findOne({ account_id });
  if (!query)
    return res.render("message", {
      user: req.session,
      message: "The account does not exist!",
    });
  if (query.user_id !== user_id)
    return res.render("message", {
      user: req.session,
      message: "Only the account owner can delete this account!",
    });
  if (query) await Account.deleteOne({ _id: query._id });
  return res.redirect("/accounts");
};

exports.getAccountEditView = async (req, res) => {
  const { account_id } = req.params;
  const { user_id } = req.session;
  if (!user_id)
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can edit an account ",
    });
  const query = await Account.findOne({
    account_id: account_id,
    user_id: user_id,
  });
  if (!query)
    return res.render("message", {
      message: "You do not own this account/it does not exist!",
    });
  return res.render("edit/account", { account: query, user: req.session });
};

exports.updateAccount = async (req, res) => {
  const { user_id } = req.session;
  const { name, accountno, sortcode, balance, account_id } = req.body;
  // if user is not logged in
  if (!user_id)
    return res.status(403).json({
      success: false,
      message: "Only authenticated users can create an account!",
    });
  // if variable not sent
  if (!account_id)
    return res.status(403).json({
      success: false,
      message: "No account id sent!",
    });
  if (!name)
    return res.status(400).json({
      success: false,
      message: "Please give a name!",
      type: "name",
    });

  if (!accountno)
    return res.status(400).json({
      success: false,
      message: "Please give an account number!",
      type: "accountno",
    });
  if (!sortcode)
    return res.status(400).json({
      success: false,
      message: "Please give a sort code.",
      type: "sortcode",
    });
  if (!balance)
    return res.status(400).json({
      success: false,
      message: "Please give a balance.",
      type: "balance",
    });
  // check input
  const validation_name = Validation.name(name);
  const validation_accountNo = Validation.numberLong(accountno);
  const validation_sortCode = Validation.numberLong(sortcode);
  const validation_balance = Validation.float(balance);
  // if validation failed
  if (!validation_name.valid)
    return res
      .status(400)
      .json({ success: false, message: validation_name.reason, type: "name" });
  if (!validation_accountNo.valid)
    return res.status(400).json({
      success: false,
      message: validation_accountNo.reason,
      type: "accountno",
    });
  if (!validation_sortCode.valid)
    return res.status(400).json({
      success: false,
      message: validation_sortCode.reason,
      type: "sortcode",
    });
  if (!validation_balance.valid)
    return res.status(400).json({
      success: false,
      message: validation_balance.reason,
      type: "balance",
    });

  const query = await Account.findOne({ account_id });
  if (!query)
    return res.status(400).json({
      success: false,
      message: "The account does not exist!",
      type: "account",
    });
  if (query.user_id !== user_id)
    return res.status(403).json({
      success: false,
      message: "Only the account owner can edit this account!",
      type: "account",
    });
  if (query) {
    query.name = name;
    query.accountno = accountno;
    query.sortcode = sortcode;
    query.balance = balance;
    await query.save();
    return res.status(200).json({ success: true, message: "Updated account!" });
  }
};
