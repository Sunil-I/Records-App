const Account = require("../../lib/models/Account");
const User = require("../../lib/models/User");
const Transaction = require("../../lib/models/Transaction");

// home page
exports.home = (req, res) => {
  res.render("index", {
    user: req.session,
  });
};

// account views
exports.editAccount = async (req, res) => {
  const { account_id } = req.params;
  const { user_id } = req.session;
  if (typeof user_id === "undefined" || typeof user_id === "null")
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
      user: req.session,
    });
  return res.render("edit/account", {
    account: query,
    user: req.session,
  });
};

exports.createAccount = async (req, res) => {
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can create an account!",
    });
  return res.render("create/account", {
    user: req.session,
  });
};

exports.accounts = async (req, res) => {
  const { user_id } = req.session;
  let { page } = req.query;
  if (typeof user_id === "undefined" || typeof user_id === "null")
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
  const accounts = await Account.find({
    user_id: user_id,
  })
    .skip(perPage * page - perPage)
    .limit(10)
    .sort([["account_id", 1]]);
  //.sort("id");
  // count number of accounts we have for user
  const count = await Account.find({
    user_id: user_id,
  }).count();
  // calculate number of pages needed
  const numberOfPages = Math.ceil(count / perPage);
  // render page
  return res.render("list/accounts", {
    user: req.session,
    accounts: accounts,
    pages: numberOfPages,
    current: page,
    q: "",
  });
};

// user views
exports.login = (req, res) => {
  res.render("user/login", {
    user: req.session,
  });
};
exports.register = (req, res) => {
  res.render("user/register", {
    user: req.session,
  });
};
exports.profile = async (req, res) => {
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.redirect("/login");
  const { user_id } = req.session;
  const accounts = await Account.find({ user_id });
  const transactions = await Transaction.find({
    account_id: accounts.map((c) => c.account_id),
  });
  return res.render("user/profile", {
    user: req.session,
    accounts: accounts.length,
    transactions: transactions.length,
  });
};

exports.verify = async (req, res) => {
  const { hash } = req.params;
  // if no hash is sent (unlikely since node errors out first)
  if (!hash)
    return res.render("user/verify", {
      message: "Please input a verification token!",
      user: req.session,
    });
  let query = await User.findOne({
    verified_hash: hash,
  });
  // if the hash is not linked to a user
  if (!query)
    return res.render("user/verify", {
      message:
        "Either the verification token is invalid or no existing user has this verification token! ",
      user: req.session,
    });
  // user is already verified
  if (query.verified)
    return res.render("user/verify", {
      message: "User is already verified!",
      user: req.session,
    });
  // verify user
  query.verified = true;
  // save
  await query.save();
  // update session if they match
  if (req.session.email === query.email) req.session.verified = true;
  // return message
  return res.render("user/verify", {
    message: "Email has been verified!",
    user: req.session,
  });
};

// transactions
exports.transactions = async (req, res) => {
  const { user_id } = req.session;
  let { page, id } = req.query;

  if (typeof user_id === "undefined" || typeof user_id === "null")
    return res.render("message", {
      message: "Only authenticated users can get transactions!",
      user: req.session,
    });
  // 10 results per page
  const perPage = 10;
  // parse page input and remove anything thats not a number
  if (page) page = parseInt(page.toString().replace(/[^0-9]/g, ""));
  // checks for page num and how many results
  if (!page) page = 1;
  // find data
  let accounts;
  if (!id) {
    accounts = await Account.find({
      user_id: user_id,
    });
  }
  if (id) {
    accounts = await Account.find({
      account_id: id,
      user_id: user_id,
    });
  }
  if (!accounts)
    return res.render("message", {
      message: "No accounts to find transactions for!",
      user: req.session,
    });

  const transactions = await Transaction.find({
    account_id: accounts.map((e) => e.account_id),
  })
    .skip(perPage * page - perPage)
    .limit(10)
    .sort([["transaction_date", -1]]);
  // count number of transactions we have for user
  const count = await Transaction.find({
    user_id: user_id,
    account_id: accounts.map((e) => e.account_id),
  }).count();
  // calculate number of pages needed
  const numberOfPages = Math.ceil(count / perPage);
  // render page
  return res.render("list/transactions", {
    user: req.session,
    transactions: transactions,
    pages: numberOfPages,
    current: page,
    q: id ? "&id=" + id : "",
  });
};

exports.createTransaction = async (req, res) => {
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can create an transaction!",
    });
  return res.render("create/transaction", {
    user: req.session,
  });
};
