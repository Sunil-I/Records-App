// models
const User = require("../../lib/models/User");
const Account = require("../../lib/models/Account");
const Transaction = require("../../lib/models/Transaction");
// packages
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Validation = require("../../lib/Validation");

// logout user
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

// create user
exports.create = async (req, res) => {
  try {
    // define params
    const { name, email, password, tos } = req.body;
    // check if we recieved valid data
    const body_validation = Validation.body([
      {
        name: "name",
        value: name,
      },
      {
        name: "email",
        value: email,
      },
      {
        name: "password",
        value: password,
      },
    ]);
    if (body_validation.length)
      return res.status(400).json({
        success: false,
        message: `${body_validation[0]} was not sent.`,
      });

    // validate data sent
    const validation_fields = Validation.validate([
      {
        name: "name",
        value: name,
        type: "name",
      },
      {
        name: "email",
        value: email,
        type: "email",
      },
      {
        name: "password",
        value: password,
        type: "password",
      },
    ]);
    // if validation failed
    if (validation_fields.length)
      return res.status(400).json({
        success: false,
        message: validation_fields[0].message,
        type: validation_fields[0].name,
      });
    // find email in database
    const query = await User.findOne({ email: email });
    // check how many users we already have
    const count = await User.find({}).countDocuments();
    // if email exists reject with 400
    if (query)
      return res.status(400).json({
        success: false,
        message: "Email is Already Registered.",
        type: "email",
      });
    if (!tos)
      return res.status(400).json({
        success: false,
        message: "Please agree to the ToS.",
        type: "tos",
      });
    // create user with a generated salt or make a random one with a unique user id
    // handle edge case of user db being empty!
    let user_id = count + 1;
    if (count == 0 || !count) user_id = 0;
    const user = new User({
      user_id: user_id,
      name: name,
      email: email,
      password: await bcrypt.hash(
        password,
        process.env.SALT || (await bcrypt.genSalt(10))
      ),
      verified: false,
      verified_hash: Array.from(Array(20), () =>
        Math.floor(Math.random() * 36).toString(36)
      ).join(""),
    });
    // save the user
    await user.save();
    // email the user
    await this.sendVerifyMail(user);
    // update session
    req.session.user_id = user.user_id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.verified = user.verified;
    req.session.created_at = user.createdAt;
    // send api response
    return res
      .status(200)
      .send({ success: true, message: "User has been registered." });
  } catch (e) {
    console.sentry(e);
    return res.status(500).json({
      success: false,
      message: "An unknown error has occurred.",
    });
  }
};
// delete user
exports.delete = async (req, res) => {
  const { password, confirm } = req.body;
  const { user_id } = req.session;

  // check if we recieved valid data
  const body_validation = Validation.body([
    {
      name: "password",
      value: password,
    },
    {
      name: "confirm",
      value: confirm,
    },
  ]);
  if (body_validation.length)
    return res.status(400).json({
      success: false,
      message: `${body_validation[0]} was not sent.`,
      type: body_validation[0],
    });
  // check if logged in
  if (typeof user_id === "undefined" || typeof user_id === "null")
    return res.status(401).json({
      success: false,
      message: "You need to be logged in!",
      type: "user",
    });
  // find user
  const user = await User.findOne({ user_id });
  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Could not find user!", type: "user" });
  // check password
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(401).send({
      success: false,
      message: "The password you entered is not correct.",
      type: "password",
    });
  }
  if (confirm === "on") {
    // find accounts
    const accounts = await Account.find({ user_id });
    // delete user
    await User.deleteOne({ user_id });
    // delete transactions
    await Transaction.deleteMany({
      account_id: accounts.map((acc) => acc.account_id),
    });
    // delete accounts
    await Account.deleteMany({ user_id });
    // destroy session
    await req.session.destroy();
    return res.status(200).json({ success: true, message: "Deleted account!" });
  } else {
    return res.status(400).json({
      success: false,
      message: "Unable to delete account!",
      type: "confirm",
    });
  }
};

// login user
exports.login = async (req, res) => {
  try {
    // define params
    const { email, password, remember } = req.body;
    // check if we recieved valid data
    const body_validation = Validation.body([
      {
        name: "email",
        value: email,
      },
      {
        name: "password",
        value: password,
      },
    ]);
    if (body_validation.length)
      return res.status(400).json({
        success: false,
        message: `${body_validation[0]} was not sent.`,
      });
    // validate data sent
    const validation_fields = Validation.validate([
      {
        name: "email",
        value: email,
        type: "email",
      },
    ]);
    // if validation failed
    if (validation_fields.length)
      return res.status(400).json({
        success: false,
        message: validation_fields[0].message,
        type: validation_fields[0].name,
      });
    // check if email is in the database
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(404).send({
        success: false,
        message: "The email you entered does not exist.",
        type: "email",
      });

    // check if password is correct
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).send({
        success: false,
        message: "The password you entered is not correct.",
        type: "password",
      });
    }
    // set session information
    req.session.user_id = user.user_id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.verified = user.verified;
    req.session.created_at = user.createdAt;
    // if remember me is selected/sent change the session to expire in 3 months rather then 12 hours
    if (remember == "on")
      req.session.cookie.originalMaxAge = 90 * 24 * 60 * 60 * 1000;
    return res
      .status(200)
      .send({ success: true, message: "Login Successful." });
  } catch (e) {
    console.sentry(e);
    return res.status(500).send({
      sucess: false,
      message: "An unknown error has occurred.",
    });
  }
};

exports.sendVerifyMail = async (user) => {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  function generateText(user) {
    let template = fs.readFileSync(
      path.join(__dirname, "..", "..", "lib", "templates", "signup.txt"),
      "utf8"
    );
    return template
      .replace("{NAME}", user.name)
      .replace("{BASE_URL}", process.env.BASE_URL)
      .replace(
        "{VERIFY_URL}",
        `${process.env.BASE_URL}verify/${user.verified_hash}`
      );
  }

  function generateHTML(user) {
    let template = fs.readFileSync(
      path.join(__dirname, "..", "..", "lib", "templates", "signup.html"),
      "utf8"
    );
    return template
      .replace("{NAME}", user.name)
      .replace("{BASE_URL}", process.env.BASE_URL)
      .replace(
        "{VERIFY_URL}",
        `${process.env.BASE_URL}verify/${user.verified_hash}`
      );
  }

  let mail = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: user.email,
    subject: "Please verify your email address.",
    text: generateText(user),
    html: generateHTML(user),
  });
  return mail;
};
