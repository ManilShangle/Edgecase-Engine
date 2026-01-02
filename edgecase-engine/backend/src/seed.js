require('dotenv').config();
const mongoose = require('mongoose');
const shortid = require('shortid');
const Problem = require('./models/problem');
const Testcase = require('./models/testcase');
const Guest = require('./models/guest');
const { generateTestcases } = require('./generator');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edgecase_engine';

async function seed(){
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB for seeding');

  // create a guest owner
  const guest_id = shortid.generate();
  await Guest.create({ guest_id });

  // sample problems
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

  for(const s of samples){
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
    console.log('Seeded problem:', p.title, 'with', docs.length, 'testcases');
  }

  console.log('Seeding done. Guest id:', guest_id);
  process.exit(0);
}

seed().catch(err=>{console.error(err); process.exit(1);});
