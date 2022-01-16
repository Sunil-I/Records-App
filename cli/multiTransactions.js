// import models
const Transaction = require("../lib/models/Transaction");
const Account = require("../lib/models/Account");
// import modules
const faker = require("faker");
const init = require("../lib/Initialization");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

// setup enviroment
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

// globals
let i;
let out = [];
let account_name;
let account_balance;
let acc;
// argument parsing
const args = process.argv;
if (args.length !== 3)
  return console.log(
    "Command Syntax: node cli/multiTransactions <number of transactions>"
  );

// main function
async function main(id) {
  // variables
  const type = Math.random() < 0.5 ? "deposit" : "withdrawal";
  const amount = parseFloat(faker.finance.amount());
  const date = faker.date.between("2015-01-01", "2022-01-01").toISOString();
  // if this transaction leads to the balance being 0 skip it
  if (account_balance - amount < 0 && type == "withdrawal")
    return console.log(
      `[${i + 1}/${
        args[2]
      }] withdrawal for account ${account_name} skipped due to negative balance ${parseFloat(
        Number(account_balance - amount).toFixed(2)
      )}`
    );
  // update account_balance
  if (type == "deposit")
    account_balance = parseFloat(Number(account_balance + amount).toFixed(2));
  if (type == "withdrawal")
    account_balance = parseFloat(Number(account_balance - amount).toFixed(2));
  // make transaction
  const transaction = new Transaction({
    transaction_id: nanoid(),
    account_name: account_name,
    account_id: id,
    type: type,
    amount: amount,
    balance: account_balance,
    transaction_date: date,
  });
  // push
  out.push(transaction);
  return console.log(
    `[${i + 1}/${
      args[2]
    }] ${type} of £${amount} for account "${account_name}" created balance is now £${account_balance}.`
  );
}

init.db().then(async () => {
  acc = await Account.find({});
  acc.forEach((e) => {
    account_name = e.name;
    account_balance = parseFloat(e.balance);
    for (i = 0; i < args[2]; i++) main(e.account_id);
    e.balance = account_balance;
  });
  Account.bulkSave(acc);
  Transaction.insertMany(out)
    .then(
      (r) =>
        `[Runner] Sucessfully Inserted ${r.length} transactions to the database.`
    )
    .then(() => process.exit(1));
});
