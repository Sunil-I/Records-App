const express = require("express");
const app = express();

const { PORT, BASE_URL } = process.env;
const init = require("../lib/Initialization");

app.listen(PORT, "127.0.0.1", () => {
  init.logging();
  init.db();
  console.log(`Express server started at ${BASE_URL}`);
});
