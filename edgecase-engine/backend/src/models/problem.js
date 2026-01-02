const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  owner_type: { type: String, enum: ['user', 'guest'], default: 'guest' },
  owner_id: { type: String, index: true },
  title: { type: String, required: true, text: true },
  source: { type: String },
  link: { type: String },
  difficulty: { type: String, enum: ['Easy','Medium','Hard','Unknown'], default: 'Unknown' },
  tags: [String],
  input_shape: { type: String, enum: ['single','multi'], default: 'single' },
  primary_ds: { type: String },
  constraints: {
    n_min: Number,
    n_max: Number,
    values_min: Number,
    values_max: Number,
    t_min: Number,
    t_max: Number,
    sum_n_max: Number,
    allow_negatives: { type: Boolean, default: false },
    allow_duplicates: { type: Boolean, default: true },
    sorted_input: { type: Boolean, default: false },
    graph: {
      directed: { type: Boolean, default: false },
      weighted: { type: Boolean, default: false },
      nodes_max: Number,
      edges_max: Number,
      allow_self_loops: { type: Boolean, default: false },
      allow_multi_edges: { type: Boolean, default: false }
    }
  },
  notes: { type: String, text: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

ProblemSchema.index({ owner_id: 1, created_at: 1 });
ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ 'constraints.n_max': 1 });

module.exports = mongoose.model('Problem', ProblemSchema);
