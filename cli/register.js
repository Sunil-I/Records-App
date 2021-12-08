const init = require("../lib/Initialization");
const User = require("../lib/models/User");
const bcrypt = require("bcrypt");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

const args = process.argv;
if (args.length !== 5)
  return console.log(
    'Command Syntax: node cli/register "<name>" <email> <password>'
  );
const name = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

async function main() {
  let count = await User.find({}).countDocuments();
  const user = new User({
    user_id: count + 1,
    name: name,
    email: email,
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
