const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  template_id: { type: String, required: true, unique: true },
  name: String,
  applicable_tags: [String],
  default_targets: [String],
  description: String
});

module.exports = mongoose.model('Template', TemplateSchema);
