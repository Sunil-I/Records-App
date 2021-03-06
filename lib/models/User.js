const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: [true, "String user_id is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "String name is required"],
    },
    isAdmin: {
      type: Boolean,
      required: [true, "Boolean isAdmin is required"],
    },
    email: {
      type: String,
      required: [true, "String email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "String password is required"],
    },
    verified: {
      type: Boolean,
      required: [true, "Boolean verified is required"],
    },
    verified_hash: {
      type: String,
      required: [true, "String verified_hash is required"],
    },
    password_reset_hash: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
