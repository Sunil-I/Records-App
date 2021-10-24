// define express
const express = require("express");
const app = express();
// define environment values
const { PORT, BASE_URL } = process.env;
// initialization functions
const init = require("../lib/Initialization");
// set hide express is running
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "<3");
  next();
});

// allow the use of req.body with JSON post + html forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// bind to port and run functions
app.listen(PORT, "127.0.0.1", () => {
  init.logging();
  init.db();
  console.log(`Express server started at ${BASE_URL}`);
});
