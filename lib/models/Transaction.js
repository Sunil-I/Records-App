const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: [true, "String transaction_id is required"],
      unique: true,
    },
    account_name: {
      type: String,
      required: [true, "String account_name is required"],
    },
    account_id: {
      type: String,
      required: [true, "String account_id is required"],
    },
    type: {
      type: String,
      required: [true, "String type is required"],
    },
    amount: {
      type: String,
      required: [true, "String amount is required"],
    },
    balance: {
      type: Number,
      required: [true, "Number balance is required"],
    },
    transaction_date: {
      type: Date,
      required: [true, "Date transaction_date is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transactions", transactionSchema);
