const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: [true, "user_id is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    verified: {
      type: Boolean,
      required: [true, "verified status is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
