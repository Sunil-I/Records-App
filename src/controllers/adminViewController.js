const Transaction = require("../../lib/models/Transaction");
const Account = require("../../lib/models/Account");
const User = require("../../lib/models/User");

// Dashboard view -> Transactions view -> Accounts view -> Users view

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
  const transactions = await Transaction.find({}).limit(1500).lean();

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
      .sort([["transaction_date", -1]]);
    count = await Transaction.find({ account_id: id }).count();
  } else {
    transactions = await Transaction.find({})
      .skip(perPage * page - perPage)
      .limit(10)
      .sort([["transaction_date", -1]]);
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
