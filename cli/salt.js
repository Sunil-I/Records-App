const bcrypt = require("bcrypt");

function salt() {
  return bcrypt.genSalt(10);
}

salt().then((salted) => console.log(`Generated Salt: ${salted}`));
