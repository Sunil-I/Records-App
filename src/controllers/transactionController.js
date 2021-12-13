const Transaction = require("../../lib/models/Transaction");
const Account = require("../../lib/models/Account");

exports.getTransactionView = async (req, res) => {
  const { user_id } = req.session;
  let { page } = req.query;

  if (!user_id)
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
  const accounts = await Account.find({ user_id: user_id });
  if (!accounts)
    return res.render("message", {
      message: "No accounts to find transactions for!",
      user: req.session,
    });
  const transactions = await Transaction.find({
    account_id: accounts.map((e) => e.account_id),
  })
    .skip(perPage * page - perPage)
    .limit(10);
  // count number of transactions we have for user
  const count = await Transaction.find({ user_id: user_id }).count();
  // calculate number of pages needed
  const numberOfPages = Math.ceil(count / perPage);
  // render page
  return res.render("list/transactions", {
    user: req.session,
    transactions: transactions,
    pages: numberOfPages,
    current: page,
  });
};

exports.create = async (req, res) => {
  const { user_id } = req.session;
  const { id, type, amount } = req.body;

  // if user is not logged in
  if (!user_id)
    return res.status(403).json({
      success: false,
      message: "Only authenticated users can create an transaction!",
    });
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "No ID sent.", type: "id" });
  if (!type)
    return res
      .status(400)
      .json({ success: false, message: "No Type sent. ", type: "type" });
  if (!amount)
    return res
      .status(400)
      .json({ success: false, message: "No amount sent.", type: "amount" });
  if (type !== "withdrawal" && type !== "deposit")
    return res.status(400).json({
      success: false,
      message: "Unknown transaction type given.",
      type: "type",
    });

  const query = await Account.findOne({ account_id: id });
  const count = await Transaction.find({}).countDocuments();
  if (!query)
    return res.status(400).json({
      success: false,
      message: "This account does not exist!",
      type: "account",
    });
  if (query.user_id !== user_id)
    return res.status(403).json({
      success: false,
      message: "Only the account owner can add an transaction!",
      type: "account",
    });

  let account_balance = parseFloat(Number(query.balance));

  // check if a withdrawal will make the account go into negatives
  if (account_balance - parseFloat(Number(amount)) < 0 && type == "withdrawal")
    return res.status(403).json({
      success: false,
      message: "You do not have the funds to contiune!",
      type: "amount",
    });

  if (type == "deposit")
    account_balance = parseFloat(Number(account_balance + amount).toFixed(2));
  if (type == "withdrawal")
    account_balance = parseFloat(Number(account_balance - amount).toFixed(2));

  query.balance = account_balance;

  const transaction = new Transaction({
    transaction_id: count + 1,
    account_id: id,
    account_name: query.name,
    type: type,
    amount: amount,
    balance: account_balance,
    transaction_date: new Date().toISOString(),
  });
  await transaction.save();
  await query.save();

  return res
    .status(200)
    .json({ success: true, message: "Created transaction." });
};

exports.delete = async (req, res) => {
  // if not logged in
  if (!req.session.user_id)
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can delete an transaction!",
    });
  // define variables
  const { transaction_id } = req.params;
  const { user_id } = req.session;
  // get transaction first
  const transaction = await Transaction.findOne({ transaction_id });
  if (!transaction)
    return res.render("message", {
      user: req.session,
      message: "This transaction does not exist!",
    });
  // get the account its linked to
  const query = await Account.findOne({ account_id: transaction.account_id });
  // the transaction ID somehow doesn't have an account so technically it is missing information.
  if (!query) {
    await Transaction.deleteOne({ _id: transaction._id})
    return res.redirect("/transactions")
  }
  // if we find an account it is linked to then we will check if the owner matches
  if (query.user_id !== user_id)
    return res.render("message", {
      user: req.session,
      message: "Only the account owner can delete this transaction!",
    });
  if (query) await Transaction.deleteOne({ _id: transaction._id });
  return res.redirect("/transactions");
};

exports.getTransactionCreateView = async (req, res) => {
  if (!req.session.user_id)
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can create an transaction!",
    });
  return res.render("create/transaction", { user: req.session });
};
