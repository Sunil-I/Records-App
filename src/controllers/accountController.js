const Account = require("../../lib/models/Account");
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
