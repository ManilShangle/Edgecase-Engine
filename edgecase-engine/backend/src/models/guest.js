const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  guest_id: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now },
  last_seen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Guest', GuestSchema);
