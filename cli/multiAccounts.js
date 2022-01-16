const init = require("../lib/Initialization");
const Account = require("../lib/models/Account");
const User = require("../lib/models/User");
const faker = require("faker");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

let count;
let i;
let out = [];

const args = process.argv;
if (args.length !== 3)
  return console.log(
    "Command Syntax: node cli/multiAccounts <number of accounts>"
  );

async function main(id) {
  let name = faker.finance.accountName();
  let balance = faker.finance.amount();
  const date = faker.date.between("2015-01-01", "2022-01-01").toISOString();
  const account = new Account({
    account_id: nanoid(),
    user_id: id,
    name: name,
    balance: balance,
    accountno: faker.finance.routingNumber(),
    sortcode: faker.finance.routingNumber(),
    createdAt: date,
  });
  out.push(account);
  return console.log(
    `[${i + 1}/${
      args[2]
    }] Account ${name} created with a balance of ${balance}.`
  );
}

init.db().then(async () => {
  const users = await User.find({});
  users.forEach((e) => {
    for (i = 0; i < args[2]; i++) main(e.user_id);
  });

  Account.insertMany(out)
    .then((r) =>
      console.log(
        `[Runner] Sucessfully Inserted ${r.length} accounts to the database.`
      )
    )
    .then(() => process.exit(1));
});
