const fs = require("fs");
const path = require("path");
const assert = require("assert");

describe("Testing templates.", function () {
  it("Templates should be able to change when given input.", function () {
    let template = fs.readFileSync(
      path.join(__dirname, "..", "lib", "templates", "signup.txt"),
      "utf8"
    );
    template = template.replace("{NAME}", "Joe")
    assert.equal(template.includes("Joe"), true);
  });
});
