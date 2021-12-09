const init = require("../lib/Initialization");
const Account = require("../lib/models/Account");
const faker = require("faker");

require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

let count;
let i;
let out = [];

const args = process.argv;
if (args.length !== 4)
  return console.log(
    "Command Syntax: node cli/accounts <user id> <number of accounts>"
  );

async function main() {
  count = count + 1;
  let name = faker.finance.accountName();
  let balance = faker.finance.amount();
  const account = new Account({
    account_id: count,
    user_id: args[2],
    name: name,
    balance: balance,
    accountno: faker.finance.routingNumber(),
    sortcode: faker.finance.routingNumber(),
  });
  out.push(account);
  return console.log(
    `[${i + 1}/${
      args[3]
    }] Account ${name} created with a balance of ${balance}.`
  );
}

init.db().then(async () => {
  count = await Account.find({}).countDocuments();
  for (i = 0; i < args[3]; i++) main();
  Account.insertMany(out)
    .then((r) =>
      console.log(
        `[Runner] Sucessfully Inserted ${r.length} accounts to the database.`
      )
    )
    .then(() => process.exit(1));
});
