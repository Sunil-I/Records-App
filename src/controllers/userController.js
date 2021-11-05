// models
const User = require("../../lib/models/User");
const bcrypt = require("bcrypt");
// packages
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
// create user
exports.create = async (req, res) => {
  try {
    // define params
    const { name, email, password } = req.body;
    // check if they exist if not return an error
    if (!name)
      return res.status(400).json({
        success: false,
        message: "Please enter a name.",
      });
    if (!password)
      return res.status(400).json({
        success: false,
        message: "Please enter a password.",
      });
    if (!email)
      return res.status(400).json({
        success: false,
        message: "Please enter a email.",
      });
    // find email in database
    const query = await User.findOne({ email: email });
    // check how many users we already have
    const count = await User.find({}).countDocuments();
    // if emaiil exists reject with 400
    if (query)
      return res.status(400).json({
        success: false,
        message: "Email is Already Registered",
      });
    // create user with a generated salt or make a random one with a unique user id
    const user = new User({
      user_id: count + 1,
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
      .send({ success: true, message: "User has been registered" });
  } catch (e) {
    console.sentry(e);
    return res
      .status(500)
      .json({
        success: false,
        message: "An unknown error has occurred - This has been logged!",
      });
  }
};
// login user
exports.login = async (req, res) => {
  try {
    // define params
    const { email, password } = req.body;
    // check if they exist if not return an error
    if (!password)
      return res.status(400).json({
        success: false,
        message: "Please enter a password.",
      });
    if (!email)
      return res.status(400).json({
        success: false,
        message: "Please enter a email.",
      });

    // check if email is in the database
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(404).send({
        success: false,
        message: "The email you entered does not exist.",
      });

    // check if password is correct
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).send({
        success: false,
        message: "The password you entered is not correct.",
      });
    }
    req.session.user_id = user.user_id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.verified = user.verified;
    req.session.created_at = user.createdAt;
    return res.status(200).send({ success: true, message: "Login Successful" });
  } catch (e) {
    console.sentry(e);
    return res
      .status(500)
      .send({
        sucess: false,
        message: "An unknown error has occurred - This has been logged!",
      });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

exports.getLoginView = (req, res) => {
  res.render("login", { user: req.session });
};
exports.getRegisterView = (req, res) => {
  res.render("register", { user: req.session });
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
