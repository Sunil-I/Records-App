const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    log_id: {
      type: String,
      required: [true, "String account_id is required"],
      unique: true,
    },
    user_id: {
      type: String,
      required: [true, "String user_id is required"],
    },
    user_email: {
      type: String,
      required: [true, "String user_email is required"],
    },
    status: {
      type: String,
      required: [true, "String status is required"],
    },
    reason: {
      type: String,
      required: [true, "String reason is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
