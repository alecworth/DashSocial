module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs", { isIndexPage: true });
  },
};