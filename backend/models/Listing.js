const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  ownerId: { type: mongoose.Types.ObjectId, required: true },
  active: { type: Boolean, required: true },
  soldToEmail: { type: String },
});

listingSchema.index({ title: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model("Listing", listingSchema);
