const shortid = require('shortid');

function clamp(v, a, b) {
  if (v == null) return null;
  return Math.max(a, Math.min(b, v));
}

function randInt(seed, a, b) {
  // simple LCG to keep deterministic behavior per-seed
  let s = seed >>> 0;
  s = (1664525 * s + 1013904223) >>> 0;
  const r = s / 0xffffffff;
  const val = Math.floor(a + r * (b - a + 1));
  return { value: val, seed: s };
}

function generateArrayTemplates(constraints, opts) {
  const nmin = constraints.n_min || 1;
  const nmax = constraints.n_max || Math.max(1, nmin);
  const vmin = constraints.values_min != null ? constraints.values_min : 0;
  const vmax = constraints.values_max != null ? constraints.values_max : Math.max(10, vmin + 10);

  const templates = [];
  const baseSeed = opts.seed || 12345;

  function mk(name, arr, targets) {
    return {
      id: shortid.generate(),
      name,
      template: 'array',
      targets: targets || [],
      params: { N: arr.length },
      content: arr.join(' '),
    };
  }

  // min size
  templates.push(mk('Min size', new Array(nmin).fill(vmin), ['boundary']));

  // small size
  templates.push(mk('Small size', new Array(Math.min(nmin+1,nmax)).fill(vmin), ['boundary']));

  // max size
  templates.push(mk('Max size', new Array(nmax).fill(vmax), ['performance']));

  // near max
  templates.push(mk('Near max', new Array(Math.max(nmax-1,nmin)).fill(vmax), ['performance']));

  // all zeros
  if (vmin <= 0 && vmax >= 0) templates.push(mk('All zeros', new Array(Math.max(1,nmin)).fill(0), ['parsing','edge']));

  // all same value (min)
  templates.push(mk('All same min', new Array(Math.max(1,nmin)).fill(vmin), ['duplicates']));
  templates.push(mk('All same max', new Array(Math.max(1,nmin)).fill(vmax), ['duplicates']));

  // alternating min/max
  const alt = [];
  for (let i=0;i<Math.max(1,nmin);i++) alt.push(i%2===0?vmin:vmax);
  templates.push(mk('Alternating min/max', alt, ['ordering','boundary']));

  // increasing
  const inc = [];
  let step = Math.max(1, Math.floor((vmax - vmin) / (Math.max(1,nmin))));
  for (let i=0;i<Math.max(1,nmin);i++) inc.push(vmin + i*step);
  templates.push(mk('Strictly increasing', inc, ['ordering']));

  // decreasing
  const dec = inc.slice().reverse();
  templates.push(mk('Strictly decreasing', dec, ['ordering']));

  // many duplicates + outlier
  const dup = new Array(Math.max(1,nmin)).fill(vmin);
  if (dup.length>0) dup[Math.floor(dup.length/2)] = vmax;
  templates.push(mk('Many duplicates + outlier', dup, ['duplicates','adversarial']));

  // negatives mixed
  if (constraints.allow_negatives) {
    const mix = [];
    for (let i=0;i<Math.max(1,nmin);i++) mix.push(i%2===0?Math.min(0,vmin):Math.max(0,vmax));
    templates.push(mk('Negatives mixed', mix, ['parsing','sign']));
  }

  // random uniform (deterministic via seed)
  if (!opts.exclude_randomness) {
    let s = baseSeed;
    const len = Math.max(1, Math.min(nmax, Math.floor((nmin + nmax)/2)));
    const arr = [];
    for (let i=0;i<len;i++) {
      const r = randInt(s, vmin, vmax);
      arr.push(r.value);
      s = r.seed;
    }
    templates.push(mk('Random uniform', arr, ['random']));
  }

  return templates;
}

function generateGraphTemplates(constraints, opts) {
  const nodes = constraints.graph && constraints.graph.nodes_max ? Math.min(5, constraints.graph.nodes_max) : 5;
  const edges_max = constraints.graph && constraints.graph.edges_max ? constraints.graph.edges_max : nodes*(nodes-1)/2;

  const templates = [];
  function mk(name, n, edges, extra) {
    // edges is array of [u,v,w?]
    const lines = [n + ' ' + edges.length];
    edges.forEach(e => lines.push(e.join(' ')));
    return {
      id: shortid.generate(),
      name,
      template: 'graph',
      targets: extra || [],
      params: { N: n, M: edges.length },
      content: lines.join('\n')
    };
  }

  // single node
  templates.push(mk('Single node', 1, [] , ['degenerate']));

  // two nodes one edge
  templates.push(mk('Two nodes one edge', 2, [[1,2]] , ['connectivity']));

  // disconnected
  templates.push(mk('Disconnected components', 4, [[1,2],[3,4]] , ['connectivity']));

  // tree
  const treeEdges = [];
  for (let i=2;i<=nodes;i++) treeEdges.push([i-1,i]);
  templates.push(mk('Tree', nodes, treeEdges, ['tree','n-1']));

  // dense
  const dense = [];
  for (let i=1;i<=nodes;i++) for (let j=i+1;j<=nodes;j++) dense.push([i,j]);
  templates.push(mk('Dense graph', nodes, dense.slice(0, Math.min(dense.length, edges_max)), ['performance']));

  return templates;
}

function generateStringTemplates(constraints, opts) {
  const nmin = constraints.n_min || 1;
  const nmax = constraints.n_max || Math.max(1, nmin);
  const templates = [];
  function mk(name, s, targets){
    return { id: shortid.generate(), name, template: 'string', targets: targets||[], params: { N: s.length }, content: s };
  }

  // empty or min length
  templates.push(mk('Empty / Min', ''.padEnd(nmin, 'a'), ['boundary']));
  // single char
  templates.push(mk('Single char', 'a'.repeat(1), ['boundary']));
  // all same char
  templates.push(mk('All same char', 'z'.repeat(Math.max(1,nmin)), ['duplicates']));
  // alternating
  let alt = '';
  for (let i=0;i<Math.max(1,nmin);i++) alt += i%2===0 ? 'a' : 'z';
  templates.push(mk('Alternating chars', alt, ['ordering']));
  // long run then change
  templates.push(mk('Long run then change', 'a'.repeat(Math.max(1,nmin-1)) + 'b', ['edge']));
  // palindrome and almost palindrome
  const pal = 'abba'.slice(0, Math.max(1,nmin));
  templates.push(mk('Palindrome', pal, ['parsing']));

  // random-ish deterministic
  if (!opts.exclude_randomness) {
    let s = opts.seed || 12345;
    const len = Math.max(1, Math.min(nmax, Math.floor((nmin + nmax)/2)));
    let str = '';
    for (let i=0;i<len;i++) {
      const r = randInt(s, 97, 122);
      s = r.seed;
      str += String.fromCharCode(r.value);
    }
    templates.push(mk('Random string', str, ['random']));
  }

  return templates;
}

function generateBinarySearchTemplates(constraints, opts) {
  const nmin = constraints.n_min || 1;
  const nmax = constraints.n_max || Math.max(1,nmin);
  const vmin = constraints.values_min != null ? constraints.values_min : 0;
  const vmax = constraints.values_max != null ? constraints.values_max : Math.max(10, vmin + 10);
  const templates = [];
  function mk(name, arr, target, targets){
    const content = arr.length + '\n' + arr.join(' ') + '\n' + target;
    return { id: shortid.generate(), name, template: 'binary_search', targets: targets||[], params: { N: arr.length, target }, content };
  }

  // target at first
  const small = new Array(Math.max(1,nmin)).fill(0).map((_,i)=> vmin + i);
  templates.push(mk('Target at first', small, small[0], ['boundary']));
  // target at last
  const last = small.slice(); last[small.length-1] = vmax;
  templates.push(mk('Target at last', last, last[last.length-1], ['boundary']));
  // not present (smaller)
  const arr1 = small.slice();
  templates.push(mk('Not present - smaller', arr1, vmin-1, ['off-by-one']));
  // not present (larger)
  const arr2 = small.slice();
  templates.push(mk('Not present - larger', arr2, vmax+1, ['off-by-one']));
  // duplicates
  const dup = new Array(Math.max(1,nmin)).fill(vmin);
  templates.push(mk('Many duplicates', dup, vmin, ['duplicates']));

  return templates;
}

function generateTestcases(problem, options) {
  const opts = Object.assign({count: 20, seed: 12345, exclude_randomness: false, mode: 'balanced', include_targets: []}, options || {});
  const constraints = problem.constraints || {};
  const tags = problem.tags || [];

  let pool = [];
  const tagset = (tags||[]).map(t=>t.toLowerCase());
  if (tagset.includes('graph') || (constraints.graph && Object.keys(constraints.graph).length>0)) {
    pool = generateGraphTemplates(constraints, opts);
  } else if (tagset.includes('strings') || tagset.includes('string')){
    pool = generateStringTemplates(constraints, opts);
  } else if (tagset.includes('binary search') || tagset.includes('binary-search')){
    // binary search templates assume sorted arrays
    pool = generateBinarySearchTemplates(constraints, opts);
  } else {
    pool = generateArrayTemplates(constraints, opts);
  }

  // weight selection by mode
  const selected = [];
  const selectionCount = Math.max(1, Math.min(opts.count, 100));
  let s = opts.seed || 12345;
  for (let i=0;i<selectionCount;i++) {
    // deterministic pick
    const r = randInt(s, 0, pool.length-1);
    s = r.seed;
    const item = pool[r.value];
    const fullContent = (() => {
      if (item.template === 'array') {
        if (problem.input_shape === 'multi') {
          // produce T and then arrays
          const T = 1;
          return [T, item.params.N + '\n' + item.content].join('\n');
        }
        return item.params.N + '\n' + item.content;
      }
      return item.content;
    })();

    selected.push({
      template_id: item.id,
      template_name: item.name,
      category: (item.targets && item.targets.includes('performance')) ? 'Performance' : 'Boundary',
      targets: item.targets || [],
      params: Object.assign({}, item.params, { seed: s }),
      content: fullContent
    });
  }

  return selected;
}

module.exports = { generateTestcases };
