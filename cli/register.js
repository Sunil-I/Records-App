const init = require("../lib/Initialization");
const User = require("../lib/models/User");
const bcrypt = require("bcrypt");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

const args = process.argv;
if (args.length !== 6)
  return console.log(
    'Command Syntax: node cli/register "<name>" <email> <password> <isAdmin>'
  );
const name = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];
const admin = process.argv[5];

async function main() {
  const user = new User({
    user_id: nanoid(),
    name: name,
    email: email,
    isAdmin: admin,
    password: await bcrypt.hash(
      password,
      process.env.SALT || (await bcrypt.genSalt(10))
    ),
    verified: false,
    verified_hash: Array.from(Array(20), () =>
      Math.floor(Math.random() * 36).toString(36)
    ).join(""),
  });
  await user.save();
  return console.log(`Registered ${name} (${email}) with password ${password}`);
}

init
  .db()
  .then(() => main())
  .then(() => process.exit(1));
