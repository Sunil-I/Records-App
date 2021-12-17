const Transaction = require("../../lib/models/Transaction");
const Account = require("../../lib/models/Account");
const Validation = require("../../lib/Validation");
exports.create = async (req, res) => {
  const { user_id } = req.session;
  const { id, type, amount } = req.body;
  // if user is not logged in
  if (!user_id)
    return res.status(403).json({
      success: false,
      message: "Only authenticated users can create an transaction!",
    });
  const body_validation = Validation.body([
    {
      name: "account id",
      value: id,
    },
    {
      name: "type",
      value: type,
    },
    {
      name: "amount",
      value: amount,
    },
  ]);
  if (body_validation.length)
    return res
      .status(400)
      .json({ success: false, message: `${body_validation[0]} was not sent.` });
  if (type !== "withdrawal" && type !== "deposit")
    return res.status(400).json({
      success: false,
      message: "transaction type can only be withdrawal or deposit.",
      type: "type",
    });
  const validation_fields = Validation.validate([
    {
      name: "account id",
      value: id,
      type: "number",
    },
    {
      name: "amount",
      value: amount,
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
  // handle edge case of where database is empty
  let transaction_id = count + 1;
  if (count == 0) transaction_id = 0;
  query.balance = account_balance;
  const transaction = new Transaction({
    transaction_id: transaction_id,
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
    await Transaction.deleteOne({ _id: transaction._id });
    return res.redirect("/transactions");
  }
  // if we find an account it is linked to then we will check if the owner matches
  if (query.user_id !== user_id)
    return res.render("message", {
      user: req.session,
      message: "Only the account owner can delete this transaction!",
    });
  if (query) await Transaction.deleteOne({ _id: transaction._id });
  // todo reverse the transaction on the bank account
  return res.redirect("/transactions");
};
