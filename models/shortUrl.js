const mongoose = require("mongoose");
const shortId = require("shortid");
const shortUrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, default: shortId.generate },
  clicks: { type: Number, required: true, default: 0 },
  email: { type: String },
  uid: { type: String },
});

module.exports = mongoose.model("ShortUrl", shortUrlSchema);
