const Transaction = require("../../lib/models/Transaction");
const Account = require("../../lib/models/Account");
const User = require("../../lib/models/User");
const Session = require("../../lib/models/Session");
const Log = require("../../lib/models/Log");
// Dashboard view -> Transactions view -> Accounts view -> View Account -> Edit Account -> Users view -> Manage view

exports.dashboard = async (req, res) => {
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users can view this page!",
      user: req.session,
    });
  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });
  const transactions = await Transaction.find({}).limit(40000).lean();

  // turn transactions into dates
  const dates = transactions.map((e) => new Date(e.transaction_date));
  // empty array for years
  const years = [];
  // for each transaction date send the year into the empty arrays
  dates.forEach((e) => {
    years.push(e.getFullYear());
  });
  // empty objects
  const yearlyTransactions = {};
  const yearlyDeposits = {};
  const yearlyWithdrawals = {};

  // loop into years and setup a counter
  for (const num of years) {
    yearlyTransactions[num] = yearlyTransactions[num]
      ? yearlyTransactions[num] + 1
      : 1;
  }

  for (const trans of transactions) {
    const amount = Number(trans.amount);
    const date = new Date(trans.transaction_date);
    const month = date.getMonth();
    const year = date.getFullYear();
    const type = trans.type;
    if (type === "withdrawal")
      yearlyWithdrawals[year] = Math.round(
        amount + Number(yearlyWithdrawals[year] || 0),
        2
      );
    if (type === "deposit")
      yearlyDeposits[year] = Math.round(
        amount + Number(yearlyDeposits[year] || 0),
        2
      );
  }

  return res.render("admin/dashboard", {
    user: req.session,
    totalTransactionsForYear: yearlyTransactions,
    totalDepositsForYear: yearlyDeposits,
    totalWithdrawalsForYear: yearlyWithdrawals,
  });
};

exports.transactions = async (req, res) => {
  let { page, id } = req.query;

  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users can view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });

  // 10 results per page
  const perPage = 10;
  // parse page input and remove anything thats not a number
  if (page) page = parseInt(page.toString().replace(/[^0-9]/g, ""));
  // checks for page num and how many results
  if (!page) page = 1;
  // find data
  let transactions;
  let count;

  if (id) {
    transactions = await Transaction.find({ account_id: id })
      .skip(perPage * page - perPage)
      .limit(10)
      .sort([["transaction_date", 1]]);
    count = await Transaction.find({ account_id: id }).count();
  } else {
    transactions = await Transaction.find({})
      .skip(perPage * page - perPage)
      .limit(10)
      .sort([["transaction_date", 1]]);
    count = await Transaction.find({}).count();
  }

  // calculate number of pages needed
  const numberOfPages = Math.ceil(count / perPage);
  // render page
  return res.render("admin/transactions", {
    user: req.session,
    transactions: transactions,
    pages: numberOfPages,
    current: page,
    q: id ? "&id=" + id : "",
  });
};

exports.accounts = async (req, res) => {
  let { page } = req.query;
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });

  // 10 results per page
  const perPage = 10;
  // parse page input and remove anything thats not a number
  if (page) page = parseInt(page.toString().replace(/[^0-9]/g, ""));
  // checks for page num and how many results
  if (!page) page = 1;
  // find data
  const accounts = await Account.find({})
    .skip(perPage * page - perPage)
    .limit(10)
    .sort([["createdAt", 1]]);
  //.sort("id");
  // count number of accounts we have for user
  const count = await Account.find({}).count();
  // calculate number of pages needed
  const numberOfPages = Math.ceil(count / perPage);
  // render page
  return res.render("admin/accounts", {
    user: req.session,
    accounts: accounts,
    pages: numberOfPages,
    current: page,
    q: "",
  });
};

exports.editAccount = async (req, res) => {
  const { account_id } = req.params;
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });

  const query = await Account.findOne({
    account_id: account_id,
  });
  if (!query)
    return res.render("message", {
      message: "This account does not exist!",
      user: req.session,
    });
  return res.render("edit/admin/account", {
    account: query,
    user: req.session,
  });
};

exports.viewAccount = async (req, res) => {
  const { account_id } = req.params;
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });
  const query = await Account.findOne({
    account_id: account_id,
  });
  if (!query)
    return res.render("message", {
      message: "This account does not exist!",
      user: req.session,
    });
  return res.render("view/admin/account", {
    account: query,
    user: req.session,
  });
};

exports.users = async (req, res) => {
  let { page } = req.query;
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can manage users",
    });

  // 10 results per page
  const perPage = 10;
  // parse page input and remove anything thats not a number
  if (page) page = parseInt(page.toString().replace(/[^0-9]/g, ""));
  // checks for page num and how many results
  if (!page) page = 1;
  // find data
  const users = await User.find({})
    .skip(perPage * page - perPage)
    .limit(10)
    .sort([["createdAt", 1]]);
  //.sort("id");
  // count number of accounts we have for user
  const count = await User.find({}).count();
  // calculate number of pages needed
  const numberOfPages = Math.ceil(count / perPage);
  // render page
  return res.render("admin/users", {
    user: req.session,
    users: users,
    pages: numberOfPages,
    current: page,
    q: "",
  });
};

exports.viewUser = async (req, res) => {
  const { user_id } = req.params;
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });

  const query = await User.findOne({
    user_id: user_id,
  });
  if (!query)
    return res.render("message", {
      message: "This user does not exist!",
      user: req.session,
    });
  return res.render("view/admin/user", {
    user: query,
  });
};

exports.editUser = async (req, res) => {
  const { user_id } = req.params;
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });

  const query = await User.findOne({
    user_id: user_id,
  });
  if (!query)
    return res.render("message", {
      message: "This user does not exist!",
      user: req.session,
    });
  return res.render("edit/admin/user", {
    user: query,
  });
};

exports.viewAccount = async (req, res) => {
  const { account_id } = req.params;
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });
  const query = await Account.findOne({
    account_id: account_id,
  });
  if (!query)
    return res.render("message", {
      message: "This account does not exist!",
      user: req.session,
    });
  return res.render("view/admin/account", {
    account: query,
    user: req.session,
  });
};

exports.manage = async (req, res) => {
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users can view this page!",
      user: req.session,
    });
  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });
  const transactions = await Transaction.find({}).lean();
  const accounts = await Account.find({}).lean();
  const users = await User.find({}).lean();
  const sessions = await Session.find({}).lean();
  const logs = await Log.find({}).lean();
  return res.render("admin/manage", {
    user: req.session,
    transactions: transactions,
    accounts: accounts,
    users: users,
    sessions: sessions,
    logs: logs,
  });
};

exports.logs = async (req, res) => {
  let { page } = req.query;
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      message: "Only authenticated users view this page!",
      user: req.session,
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "Only admins can view this page!",
    });

  // 10 results per page
  const perPage = 10;
  // parse page input and remove anything thats not a number
  if (page) page = parseInt(page.toString().replace(/[^0-9]/g, ""));
  // checks for page num and how many results
  if (!page) page = 1;
  // find data
  const logs = await Log.find({})
    .skip(perPage * page - perPage)
    .limit(10)
    .sort([["createdAt", -1]]);
  //.sort("id");
  // count number of accounts we have for user
  const count = await Log.find({}).count();
  // calculate number of pages needed
  const numberOfPages = Math.ceil(count / perPage);
  // render page
  return res.render("admin/logs", {
    user: req.session,
    logs: logs,
    pages: numberOfPages,
    current: page,
    q: "",
  });
};
