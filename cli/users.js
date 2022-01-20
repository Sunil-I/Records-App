const init = require("../lib/Initialization");
const User = require("../lib/models/User");
const faker = require("faker");
const bcrypt = require("bcrypt");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

let i;
let out = [];

const args = process.argv;
if (args.length !== 3)
  return console.log("Command Syntax: node cli/users <number of accounts>");

async function main() {
  let name = faker.name.findName();
  let email = faker.internet.email();
  let password = faker.internet.password();

  const user = new User({
    user_id: nanoid(),
    name: name,
    email: email,
    isAdmin: false,
    password: bcrypt.hashSync(
      password,
      process.env.SALT ||
        Array.from(Array(20), () =>
          Math.floor(Math.random() * 36).toString(36)
        ).join("")
    ),
    verified: Math.random() < 0.5,
    verified_hash: Array.from(Array(20), () =>
      Math.floor(Math.random() * 36).toString(36)
    ).join(""),
  });
  out.push(user);
  return console.log(
    `[${i + 1}/${
      args[2]
    }] User ${name} (${email}) created with a password of ${password}`
  );
}

init.db().then(async () => {
  for (i = 0; i < args[2]; i++) main();
  User.insertMany(out)
    .then((r) =>
      console.log(
        `[Runner] Sucessfully inserted ${r.length} users to the database.`
      )
    )
    .then(() => process.exit(0));
});
