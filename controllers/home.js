module.exports = {
  getIndex: (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect("/profile"); // Redirect if logged in
    }
    res.render("index.ejs", { isIndexPage: true });
  },
};
