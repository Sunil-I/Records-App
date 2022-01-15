const Account = require("../../lib/models/Account");
const Transaction = require("../../lib/models/Transaction");
exports.transactions = async (req, res) => {
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.redirect("/login");
  const accounts = await Account.find({
    user_id: req.session.user_id,
  });

  const transactions = await Transaction.find({
    account_id: accounts.map((c) => c.account_id),
  });

  // turn transactions into dates
  const dates = transactions.map((e) => new Date(e.transaction_date));
  // empty array for months
  const months = [];
  // empty array for years
  const years = [];
  // for each transaction date send the month/year into the empty arrays
  dates.forEach((e) => {
    months.push(e.getMonth());
    years.push(e.getFullYear());
  });
  // empty objects
  const monthlyTransactions = {};
  const yearlyTransactions = {};

  const monthlyWithdrawals = {};
  const yearlyWithdrawals = {};
  const monthlyDeposits = {};
  const yearlyDeposits = {};

  // loop into months and setup a counter
  for (const num of months) {
    monthlyTransactions[num] = monthlyTransactions[num]
      ? monthlyTransactions[num] + 1
      : 1;
  }

  // loop into years and setup a counter
  for (const num of years) {
    yearlyTransactions[num] = yearlyTransactions[num]
      ? yearlyTransactions[num] + 1
      : 1;
  }

  // loop through transactions and add balances to object
  for (const trans of transactions) {
    const amount = Number(trans.amount);
    const date = new Date(trans.transaction_date);
    const month = date.getMonth();
    const year = date.getFullYear();
    const type = trans.type;
    if (type === "withdrawal")
      monthlyWithdrawals[month] = Math.round(
        amount + Number(monthlyWithdrawals[month] || 0),
        2
      );
    if (type === "withdrawal")
      yearlyWithdrawals[year] = Math.round(
        amount + Number(yearlyWithdrawals[year] || 0),
        2
      );
    if (type === "deposit")
      monthlyDeposits[month] = Math.round(
        amount + Number(monthlyDeposits[month] || 0),
        2
      );
    if (type === "deposit")
      yearlyDeposits[year] = Math.round(
        amount + Number(yearlyDeposits[year] || 0),
        2
      );
  }

  // return data
  return res.render("visualizations/transactions", {
    user: req.session,
    monthlyTransactions: Object.values(monthlyTransactions),
    yearlyTransactions: yearlyTransactions,
    monthlyDeposits: Object.values(monthlyDeposits),
    monthlyWithdrawals: Object.values(monthlyWithdrawals),
    yearlyDeposits: yearlyDeposits,
    yearlyWithdrawals: yearlyWithdrawals,
  });
};

exports.accounts = async (req, res) => {
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.redirect("/login");
  const accounts = await Account.find({
    user_id: req.session.user_id,
  });

  // turn accounts into dates
  const dates = accounts.map((e) => new Date(e.createdAt));
  // empty array for months
  const months = [];
  // empty array for years
  const years = [];
  // for each account date send the month/year into the empty arrays
  dates.forEach((e) => {
    months.push(e.getMonth());
    years.push(e.getFullYear());
  });

  const monthlyAccounts = {};
  const yearlyAccounts = {};

  // loop into months and setup a counter
  for (const num of months) {
    monthlyAccounts[num] = monthlyAccounts[num] ? monthlyAccounts[num] + 1 : 1;
  }
  // loop into years and setup a counter
  for (const num of years) {
    yearlyAccounts[num] = yearlyAccounts[num] ? yearlyAccounts[num] + 1 : 1;
  }

  // return data
  return res.render("visualizations/accounts", {
    user: req.session,
    yearlyAccounts: yearlyAccounts,
    monthlyAccounts: Object.values(monthlyAccounts),
  });
};
