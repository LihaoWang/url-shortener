require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();

const url = process.env.DB_URL;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
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
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", {
    shortUrls: shortUrls,
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
  });
});

app.get("/profile", requiresAuth(), async (req, res) => {
  data = await ShortUrl.find({ email: req.oidc.user.email });
  console.log(data);
  res.render("profile", { data: data });
});

app.post("/shrink", async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    try {
      await ShortUrl.create({
        originalUrl: req.body.fullUrl,
        email: req.oidc.user.email,
      });
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.redirect("/");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/delete/:shortUrl", async (req, res) => {
  await ShortUrl.deleteOne({ shortUrl: req.params.shortUrl });
  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ shortUrl: req.params.shortUrl });
  if (shortUrl == null) {
    return res.status(404).send("No such url found");
  }
  shortUrl.clicks++;
  shortUrl.save();
  res.redirect(shortUrl.originalUrl);
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server started");
});

module.exports = app;
