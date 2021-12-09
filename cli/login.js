const init = require("../lib/Initialization");
const User = require("../lib/models/User");
const bcrypt = require("bcrypt");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

const args = process.argv;
if (args.length !== 4)
  return console.log("Command Syntax: node cli/login <email> <password>");
const email = process.argv[2];
const password = process.argv[3];

async function main() {
  let user = await User.findOne({ email: email });
  if (!user) return console.log("Email is unregistered");
  const validPass = await bcrypt.compare(password, user.password);
  if (validPass) return console.log(`Logged in as ${user.name}`);
  if (!validPass) return console.log("Password is incorrect.");
}

init
  .db()
  .then(() => main())
  .then(() => process.exit(1));
