const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  displayName: { type: String, required: true },
  password: { type: String, required: true },
  isBanned: { type: Boolean, required: false },
  ratings: [
    {
      raterId: { type: mongoose.Types.ObjectId, required: true },
      rating: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
