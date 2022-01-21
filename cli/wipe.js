const init = require("../lib/Initialization");
const User = require("../lib/models/User");
const Account = require("../lib/models/Account");
const Transaction = require("../lib/models/Transaction");
const Session = require("../lib/models/Session");
const Log = require("../lib/models/Log");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

const args = process.argv;
if (args.length !== 3) return console.log("Command Syntax: node cli/wipe yes");
const confirm = process.argv[2];
if (confirm.toLowerCase() !== "yes")
  return console.log("You need to confirm before wiping everything!");
async function main() {
  await User.deleteMany({});
  await Account.deleteMany({});
  await Transaction.deleteMany({});
  await Session.deleteMany({});
  await Log.deleteMany({});
  return console.log("Wiped all data!");
}

init
  .db()
  .then(() => main())
  .then(() => process.exit(0));
