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
  it("a name should return as false.", function () {
    assert.equal(Validation.name("a name").valid, false);
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

describe("Testing number validation.", function () {
  it("123 should return as true.", function () {
    assert.equal(Validation.number("123").valid, true);
  });
  it("3c should return as false.", function () {
    assert.equal(Validation.number("3c").valid, false);
  });
  it("3. should return as false.", function () {
    assert.equal(Validation.number("3.").valid, false);
  });
});

describe("Testing undefined validation.", function () {
  it("should return a empty payload.", function () {
    assert.equal(Validation.body([{ name: "test", value: "test" }]).length, 0);
  });
  it("should return a payload of one error.", function () {
    assert.equal(
      Validation.body([{ name: "test", value: undefined }]).length,
      1
    );
  });
  it("should return a payload of two errors.", function () {
    assert.equal(
      Validation.body([
        { name: "test", value: undefined },
        { name: "null", value: null },
      ]).length,
      2
    );
  });
});

describe("Testing mixed validation.", function () {
  it("should return an empty payload", function () {
    assert.equal(
      Validation.validate([{ name: "name", value: "test name", type: "name" }])
        .length,
      0
    );
  });
  it("should return a payload of one error.", function () {
    assert.equal(
      Validation.validate([{ name: "number", value: "3c", type: "number" }])
        .length,
      1
    );
  });
  it("should return a payload of two errors.", function () {
    assert.equal(
      Validation.validate([
        { name: "name", value: "test", type: "name" },
        { name: "float", value: "1.2c", type: "float" },
      ]).length,
      2
    );
  });
});
