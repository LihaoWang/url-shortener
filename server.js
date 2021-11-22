const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();

mongoose.connect("mongodb://localhost/urlShortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});

app.post("/shrink", async (req, res) => {
  await ShortUrl.create({ originalUrl: req.body.fullUrl });
  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ shortUrl: req.params.shortUrl });
  if (shortUrl == null) {
    return res.send("No such url found");
  }
  shortUrl.clicks++;
  shortUrl.save();
  res.redirect(shortUrl.originalUrl);
});

app.listen(process.env.PORT || 5000);
