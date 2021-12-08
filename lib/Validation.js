// regexes
const regex = {
  email: new RegExp(
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
  ),
  number: new RegExp(/^[0-9]+$/),
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

exports.number = (number) => {
  if (!number) return { valid: false, reason: "No Input was sent." };
  if (number.length < 8)
    return {
      valid: false,
      reason: "Input is too short (minimum is 8 characters)",
    };
  if (!regex.number.test(number))
    return { valid: false, reason: "Input contains letters." };
  return { valid: true };
};
