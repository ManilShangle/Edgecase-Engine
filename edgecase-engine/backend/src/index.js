require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');

const Guest = require('./models/guest');
const Problem = require('./models/problem');
const Testcase = require('./models/testcase');
const { generateTestcases, canonicalizeTestcase } = require('./generator');

const app = express();
app.use(cors());
app.use(express.json({limit: '1mb'}));

const MONGO = process.env.MONGO_URI;

async function start() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB, database:', mongoose.connection.name);
    mongoose.connection.on('error', err => console.error('Mongoose connection error:', err));
    mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected'));
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, ()=>{
      console.log('Server running on port', PORT);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

start();

// POST /api/guest -> returns guest_id
app.post('/api/guest', async (req, res)=>{
  try {
    const guest_id = shortid.generate();
    const g = new Guest({ guest_id });
    await g.save();
    res.json({ guest_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create guest' });
  }
});

// POST /api/seed -> create demo sample problems and testcases, return guest_id
app.post('/api/seed', async (req, res)=>{
  try {
    const guest_id = shortid.generate();
    await Guest.create({ guest_id });

    const samples = [
      {
        owner_type: 'guest', owner_id: guest_id,
        title: 'Array Sum / Prefix Sum Overflow Trap',
        source: 'Other', difficulty: 'Medium', tags: ['arrays','math','prefix sums'],
        input_shape: 'single', primary_ds: 'array',
        constraints: { n_min: 1, n_max: 10, values_min: -1000000000, values_max: 1000000000, allow_negatives: true, allow_duplicates: true },
        notes: 'Large values cause overflow in 32-bit accumulators.'
      },
      {
        owner_type: 'guest', owner_id: guest_id,
        title: 'Graph Connectivity Edge Cases',
        source: 'Codeforces', difficulty: 'Medium', tags: ['graphs','connectivity'],
        input_shape: 'single', primary_ds: 'graph',
        constraints: { graph: { directed: false, weighted: false, nodes_max: 8, edges_max: 28 } },
        notes: 'Disconnected components and single-node graphs.'
      },
      {
        owner_type: 'guest', owner_id: guest_id,
        title: 'Binary Search Boundary Issues',
        source: 'AtCoder', difficulty: 'Easy', tags: ['binary search','arrays','sorting'],
        input_shape: 'single', primary_ds: 'array',
        constraints: { n_min: 1, n_max: 8, values_min: 0, values_max: 100, sorted_input: true },
        notes: 'Targets at edges and duplicates.'
      }
    ];

    const seeded = [];
    for (const s of samples) {
      const p = await Problem.create(s);
      const generated = generateTestcases(p, { count: 15, seed: 1000 });
      const docs = generated.map(g => ({
        problem_id: p._id,
        owner_type: 'guest', owner_id: guest_id,
        name: g.template_name,
        category: g.category,
        targets: g.targets,
        template_id: g.template_id,
        params: g.params,
        content: g.content
      }));
      await Testcase.insertMany(docs);
      seeded.push({ problem: p, testcases: docs.length });
    }

    res.json({ guest_id, seeded });
  } catch (err) {
    console.error('seed error', err);
    res.status(500).json({ error: 'failed to seed' });
  }
});

// Create problem
app.post('/api/problems', async (req, res)=>{
  try {
    const body = req.body;
    const p = new Problem(Object.assign({}, body));
    await p.save();
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create problem' });
  }
});

// List problems for owner_id (owner_id in query)
app.get('/api/problems', async (req, res)=>{
  try {
    const owner_id = req.query.owner_id;
    const q = owner_id ? { owner_id } : {};
    const list = await Problem.find(q).sort({ created_at: -1 }).limit(200).exec();
    res.json(list);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'failed to list problems' });
  }
});

// Get problem detail
app.get('/api/problems/:id', async (req,res)=>{
  try{
    const p = await Problem.findById(req.params.id).exec();
    if(!p) return res.status(404).json({error:'not found'});
    const count = await Testcase.countDocuments({ problem_id: p._id });
    res.json({ problem: p, testcase_count: count });
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed'});
  }
});

// Update problem
app.put('/api/problems/:id', async (req,res)=>{
  try{
    const updated = await Problem.findByIdAndUpdate(req.params.id, Object.assign({}, req.body, { updated_at: new Date() }), { new: true });
    res.json(updated);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to update'});
  }
});

// Delete problem and its testcases
app.delete('/api/problems/:id', async (req,res)=>{
  try{
    await Testcase.deleteMany({ problem_id: req.params.id });
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to delete'});
  }
});

// Generate edgecases (preview, not saved)
app.post('/api/problems/:id/generate', async (req,res)=>{
  try{
    const p = await Problem.findById(req.params.id).exec();
    if(!p) return res.status(404).json({error:'not found'});
    const opts = req.body || {};
    const generated = generateTestcases(p, opts);
    res.json({ generated });
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to generate'});
  }
});

// Save bulk testcases
app.post('/api/problems/:id/testcases/bulk', async (req,res)=>{
  try{
    const arr = req.body.testcases || [];
    // fetch existing canonical keys for this problem
    const existing = await Testcase.find({ problem_id: req.params.id }).select('canonical_key').exec();
    const existingKeys = new Set(existing.map(e=>e.canonical_key).filter(Boolean));
    const saved = [];
    const skipped = [];
    for(const t of arr){
      // compute canonical key if present in payload or via generator helper
      const payloadKey = t.canonical_key || (t.content ? (canonicalizeTestcase({ template: t.template || t.template_name || 'generic', content: t.content, params: t.params || {} }) || {}).key : null);
      if (payloadKey && existingKeys.has(payloadKey)){
        skipped.push({ reason: 'duplicate', canonical_key: payloadKey, template_name: t.template_name });
        continue;
      }
      const doc = new Testcase({
        problem_id: req.params.id,
        owner_type: t.owner_type || 'guest',
        owner_id: t.owner_id || null,
        name: t.template_name || 'Generated',
        category: t.category || 'Boundary',
        targets: t.targets || [],
        template_id: t.template_id || null,
        params: t.params || {},
        content: t.content || '',
        canonical_key: payloadKey || null
      });
      await doc.save();
      saved.push(doc);
      if (payloadKey) existingKeys.add(payloadKey);
    }
    res.json({ saved_count: saved.length, skipped_count: skipped.length, saved, skipped });
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to save testcases'});
  }
});

// Add manual testcase
app.post('/api/problems/:id/testcases', async (req,res)=>{
  try{
    const body = req.body;
    const doc = new Testcase(Object.assign({}, body, { problem_id: req.params.id }));
    await doc.save();
    res.json(doc);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to add testcase'});
  }
});

// List testcases with filters
app.get('/api/problems/:id/testcases', async (req,res)=>{
  try{
    const q = { problem_id: req.params.id };
    if (req.query.pinned) q.pinned = req.query.pinned === 'true';
    if (req.query.targets) q.targets = { $in: req.query.targets.split(',') };
    if (req.query.search) q.$text = { $search: req.query.search };
    const list = await Testcase.find(q).sort({ pinned: -1, created_at: -1 }).limit(1000).exec();
    res.json(list);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to list testcases'});
  }
});

// Get testcase
app.get('/api/testcases/:id', async (req,res)=>{
  try{
    const t = await Testcase.findById(req.params.id).exec();
    if(!t) return res.status(404).json({error:'not found'});
    res.json(t);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed'});
  }
});

// Edit testcase
app.put('/api/testcases/:id', async (req,res)=>{
  try{
    const updated = await Testcase.findByIdAndUpdate(req.params.id, Object.assign({}, req.body, { updated_at: new Date() }), { new: true });
    res.json(updated);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to update'});
  }
});

// Delete testcase
app.delete('/api/testcases/:id', async (req,res)=>{
  try{
    await Testcase.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to delete'});
  }
});

// Export (simple combined text)
app.get('/api/problems/:id/export', async (req,res)=>{
  try{
    const p = await Problem.findById(req.params.id).exec();
    const list = await Testcase.find({ problem_id: req.params.id }).sort({ pinned: -1, created_at: -1 }).exec();
    const includeComments = req.query.comments === 'true';
    let blob = '';
    for(const t of list){
      if(includeComments){
        const cat = t.category || '';
        const tpl = t.name || t.template_name || '';
        const targets = (t.targets || []).join(', ');
        const purpose = t.explanation || t.template_explain || '';
        blob += `${cat} | ${tpl} | targets: ${targets}\n`;
        blob += `Purpose: ${purpose}\n`;
      }
      blob += t.content + '\n\n';
    }
    res.setHeader('Content-Type','text/plain');
    res.send(blob);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'failed to export'});
  }
});

const PORT = process.env.PORT || 4000;
