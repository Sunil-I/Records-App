exports.getHomeView = (req, res) => {
  res.render("index", { user: req.session });
};
