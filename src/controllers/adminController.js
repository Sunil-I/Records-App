const Transaction = require("../../lib/models/Transaction");
const Account = require("../../lib/models/Account");
const User = require("../../lib/models/User");

// Delete transaction -> View Account -> Edit account -> Delete account
exports.deleteTransaction = async (req, res) => {
  // if not logged in
  if (
    typeof req.session.user_id === "undefined" ||
    typeof req.session.user_id === "null"
  )
    return res.render("message", {
      user: req.session,
      message: "Only authenticated users can delete an transaction!",
    });

  if (!req.session.isAdmin)
    return res.render("message", {
      user: req.session,
      message: "You do not have permission to delete this transaction",
    });

  // define variables
  const { transaction_id } = req.params;
  // get transaction first
  const transaction = await Transaction.findOne({ transaction_id });
  if (!transaction)
    return res.render("message", {
      user: req.session,
      message: "This transaction does not exist!",
    });
  await Transaction.deleteOne({ _id: transaction._id });
  // redirect
  return res.redirect("/admin/transactions");
};
