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
