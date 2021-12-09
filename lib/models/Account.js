const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    account_id: {
      type: Number,
      required: [true, "Number account_id is required"],
      unique: true,
    },
    user_id: {
      type: Number,
      required: [true, "Number user_id is required"],
    },
    name: {
      type: String,
      required: [true, "String name is required"],
    },
    balance: {
      type: String,
      required: [true, "String balance is required"],
    },
    accountno: {
      type: Number,
      required: [true, "Number accountno is required"],
    },
    sortcode: {
      type: Number,
      required: [true, "Number sortcode is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
