const mongoose = require('mongoose');

const TestcaseSchema = new mongoose.Schema({
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', index: true },
  owner_type: { type: String, enum: ['user','guest'], default: 'guest' },
  owner_id: { type: String, index: true },
  name: { type: String, text: true },
  category: { type: String },
  targets: [String],
  template_id: String,
  params: Object,
  content: { type: String, text: true },
  pinned: { type: Boolean, default: false, index: true },
  found_bug: { type: Boolean, default: false },
  failure_type: { type: String, enum: ['WA','TLE','MLE','RE','parsing','unknown'], default: 'unknown' },
  bug_note: { type: String, text: true },
  expected_output: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

TestcaseSchema.index({ problem_id: 1, created_at: 1 });
TestcaseSchema.index({ targets: 1 });

module.exports = mongoose.model('Testcase', TestcaseSchema);
