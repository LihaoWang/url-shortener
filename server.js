require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();

mongoose.connect("mongodb://localhost/urlShortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { auth } = require("express-openid-connect");
const { requiresAuth } = require("express-openid-connect");
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: "https://dev-atm-dryo.us.auth0.com",
};
app.use(auth(config));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", {
    shortUrls: shortUrls,
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
  });
});

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.post("/shrink", async (req, res) => {
  await ShortUrl.create({ originalUrl: req.body.fullUrl });
  res.redirect("/");
});

app.get("/delete/:shortUrl", async (req, res) => {
  await ShortUrl.deleteOne({ shortUrl: req.params.shortUrl });
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

app.listen(process.env.PORT || 5000, () => {
  console.log("Server started");
});
