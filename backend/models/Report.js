const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reportedUserId: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Report", reportSchema);
