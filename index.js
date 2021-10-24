require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});
require("./src/app");
