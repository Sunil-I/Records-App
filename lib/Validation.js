// regexes
const regex = {
  email: new RegExp(
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
  ),
  number: new RegExp(/^[0-9]+$/),
  float: new RegExp(/^(0|[1-9]\d*)(\.\d+)?$/),
};
exports.email = (email) => {
  if (!email)
    return {
      valid: false,
      reason: "No email was sent.",
    };

  if (email.length > 64)
    return {
      valid: false,
      reason: "Please use a shorter email.",
    };

  if (!regex.email.test(email))
    return {
      valid: false,
      reason: "Please input a valid email.",
    };

  const parts = email.split("@");
  if (parts[0].length > 64)
    return {
      valid: false,
      reason: "Email username is too long.",
    };

  const domainParts = parts[1].split(".");
  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  )
    return {
      valid: false,
      reason: "Email domain is too long",
    };

  return {
    valid: true,
  };
};
exports.name = (name) => {
  if (!name)
    return {
      valid: false,
      reason: "Please give a name.",
    };
  if (name.length < 8)
    return {
      valid: false,
      reason: "Name is too short (minimum is 8 characters)",
    };
  const parts = name.split(" ");
  if (parts.length <= 1)
    return {
      valid: false,
      reason: "First name only detected (e.g John Smith)",
    };
  return { valid: true };
};
exports.password = (password) => {
  if (!password)
    return {
      valid: false,
      reason: "Please give a password.",
    };
  if (password.length < 8)
    return {
      valid: false,
      reason: "Password is too short (minimum is 8 characters)",
    };
  return { valid: true };
};

exports.numberLong = (number) => {
  if (!number) return { valid: false, reason: "No Input was sent." };
  if (number.toString().length < 8)
    return {
      valid: false,
      reason: "Input is too short (minimum is 8 characters)",
    };
  if (!regex.number.test(number))
    return { valid: false, reason: "Input contains letters." };
  return { valid: true };
};

exports.numberShprt = (number) => {
  if (!number) return { valid: false, reason: "No Input was sent." };
  if (number.toString().length < 6)
    return {
      valid: false,
      reason: "Input is too short (minimum is 6 characters)",
    };
  if (!regex.number.test(number))
    return { valid: false, reason: "Input contains letters." };
  return { valid: true };
};

exports.number = (number) => {
  if (!number) return { valid: false, reason: "No Input was sent." };
  if (!regex.number.test(number))
    return { valid: false, reason: "Input contains letters." };
  return { valid: true };
};

exports.float = (number) => {
  if (!number) return { valid: false, reason: "No Input was sent." };
  if (!regex.float.test(number))
    return { valid: false, reason: "Input contains letters." };
  return { valid: true };
};

exports.body = (body) => {
  let out = [];
  for (let i = 0; i < body.length; i++) {
    let object = body[i];
    if (!object.value) out.push(object.name);
  }
  return out;
};

exports.validate = (body) => {
  let out = [];
  for (let i = 0; i < body.length; i++) {
    // define
    let object = body[i];
    let { name, type, value } = object;
    // handle types
    switch (type) {
      case "email":
        var test = this.email(value);
        if (test.valid === false)
          out.push({
            name: name,
            type: type,
            message: test.reason,
          });
        break;
      case "name":
        var test = this.name(value);
        if (test.valid === false)
          out.push({
            name: name,
            type: type,
            message: test.reason,
          });
        break;
      case "password":
        var test = this.password(value);
        if (test.valid === false)
          out.push({
            name: name,
            type: type,
            message: test.reason,
          });
        break;
      case "numberLong":
        var test = this.numberLong(value);
        if (test.valid === false)
          out.push({
            name: name,
            type: type,
            message: test.reason,
          });
        break;
      case "numberShort":
        var test = this.numberShort(value);
        if (test.valid === false)
          out.push({
            name: name,
            type: type,
            message: test.reason,
          });
        break;
      case "number":
        var test = this.number(value);
        if (test.valid === false)
          out.push({
            name: name,
            type: type,
            message: test.reason,
          });
        break;
      case "float":
        var test = this.float(value);
        if (test.valid === false)
          out.push({
            name: name,
            type: type,
            message: test.reason,
          });
        break;
    }
  }
  return out;
};
