const Validation = require("../lib/Validation");
const assert = require("assert");

describe("Testing email validation.", function () {
  it("admin@example.com should return as true.", function () {
    assert.equal(Validation.email("admin@example.com").valid, true);
  });
  it("admin@example should return as false.", function () {
    assert.equal(Validation.email("admin@example").valid, false);
  });
  it("admin@.com should return as false.", function () {
    assert.equal(Validation.email("admin@.com").valid, false);
  });
  it("admin@ should return as false.", function () {
    assert.equal(Validation.email("admin@").valid, false);
  });
});

describe("Testing name validation.", function () {
  it("admin user should return as true.", function () {
    assert.equal(Validation.name("admin user").valid, true);
  });
  it("admin should return as false.", function () {
    assert.equal(Validation.name("admin").valid, false);
  });
  it("a a should return as false.", function () {
    assert.equal(Validation.name("a a").valid, false);
  });
});

describe("Testing password validation.", function () {
  it("password123 should return as true.", function () {
    assert.equal(Validation.password("password123").valid, true);
  });
  it("pass should return as false.", function () {
    assert.equal(Validation.password("pass").valid, false);
  });
  it("pass123 should return as false.", function () {
    assert.equal(Validation.password("pass123").valid, false);
  });
});
