const shortid = require('shortid');
const crypto = require('crypto');

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
      explain: name,
      preview: (arr.slice(0,5).join(' ') + (arr.length>5 ? ' ...' : '')).toString(),
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
      content: lines.join('\n'),
      explain: name,
      preview: (n + ' nodes, ' + edges.length + ' edges; ' + (edges.slice(0,3).map(e=>e.join('-')).join(', ') + (edges.length>3 ? ' ...' : '')))
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
    return { id: shortid.generate(), name, template: 'string', targets: targets||[], params: { N: s.length }, content: s, explain: name, preview: (s.length>30? s.slice(0,27) + '...' : s) };
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
    return { id: shortid.generate(), name, template: 'binary_search', targets: targets||[], params: { N: arr.length, target }, content, explain: name, preview: (arr.slice(0,10).join(' ') + (arr.length>10? ' ...' : '') + '  target=' + target) };
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

function generateEventTemplates(constraints, opts) {
  const nmin = constraints.n_min || 5;
  const nmax = constraints.n_max || Math.max(5, nmin);
  const maxUsers = constraints.max_users || Math.min(4, Math.max(2, Math.floor((nmax)/3)));
  const maxBytes = constraints.max_bytes != null ? constraints.max_bytes : 1000;
  const jitter = constraints.jitter_ms != null ? constraints.jitter_ms : 2000;

  const templates = [];
  const baseSeed = opts.seed || 12345;

  function mk(name, events, targets, params){
    return {
      id: shortid.generate(),
      name,
      template: 'events',
      targets: targets || [],
      params: Object.assign({ N: events.length }, params || {}),
      content: events.join('\n'),
      explain: name,
      preview: events.slice(0,3).join(' | ') + (events.length>3? ' | ...' : '')
    }
  }

  // helper to synthesize events deterministically
  function synthesize(seed, N, usersCount, baseTs, sizes, optsLocal){
    let s = seed >>> 0;
    const lines = [];
    const users = [];
    for(let i=0;i<usersCount;i++) users.push('u'+(i+1));
    let t = baseTs;
    for(let i=0;i<N;i++){
      // step between events 100..1500ms
      const r1 = randInt(s, 100, 1500); s = r1.seed; t += r1.value;
      const user = users[i % users.length];
      const size = sizes && sizes[i] != null ? sizes[i] : randInt(s, Math.max(1, Math.floor(maxBytes/10)), Math.max(1, Math.floor(maxBytes/2))).value;
      // apply jitter
      const rj = randInt(s, -jitter, jitter); s = rj.seed; const ts = t + rj.value;
      lines.push(ts + ' ' + user + ' ' + size);
    }
    return { lines, seed: s };
  }

  // Template: boundary timestamps (t and t+60000)
  (function(){
    const seed = baseSeed + 11;
    const N = Math.max(nmin, 6);
    const baseTs = 1600000000000;
    const sizes = new Array(N).fill(Math.floor(maxBytes/4));
    const s = synthesize(seed, N, Math.min(3, maxUsers), baseTs, sizes);
    // insert explicit boundary event
    const idx = Math.min(1, s.lines.length-1);
    const parts = s.lines.slice();
    const split = parts[idx].split(' ');
    const boundaryTs = (Number(split[0]) + 60000).toString();
    parts.splice(idx+1,0, boundaryTs + ' ' + split[1] + ' ' + split[2]);
    templates.push(mk('Boundary timestamps (t and t+60000)', parts, ['boundary','window'], { max_bytes: maxBytes }));
  })();

  // Template: out-of-order event that retroactively pushes window over limit
  (function(){
    const seed = baseSeed + 22;
    const N = Math.max(nmin, 6);
    const baseTs = 1600000100000;
    // craft sizes that approach maxBytes
    const sizes = [];
    let acc = 0;
    for(let i=0;i<N;i++){
      const v = (i===N-1) ? Math.max(1, Math.floor(maxBytes - acc + 50)) : Math.max(1, Math.floor(maxBytes/(N) - 10));
      sizes.push(v); acc += v;
    }
    const s = synthesize(seed, N, 2, baseTs, sizes);
    // make last event timestamp slightly earlier (out-of-order arrival)
    const parts = s.lines.slice();
    const lastParts = parts.pop().split(' ');
    const earlyTs = (Number(lastParts[0]) - 1200).toString();
    parts.push(earlyTs + ' ' + lastParts[1] + ' ' + lastParts[2]);
    templates.push(mk('Out-of-order retro push', parts, ['ordering','adversarial'], { max_bytes: maxBytes }));
  })();

  // Template: duplicates near the limit
  (function(){
    const seed = baseSeed + 33;
    const N = Math.max(nmin, 5);
    const baseTs = 1600000200000;
    const sizes = new Array(N).fill(Math.max(1, Math.floor(maxBytes/3)));
    const s = synthesize(seed, N, Math.min(3, maxUsers), baseTs, sizes);
    const parts = s.lines.slice();
    // duplicate middle line
    const mid = Math.floor(parts.length/2);
    parts.splice(mid+1,0, parts[mid]);
    templates.push(mk('Duplicates near limit', parts, ['duplicates','adversarial'], { max_bytes: maxBytes }));
  })();

  // Template: mixed sizes barely exceed limit
  (function(){
    const seed = baseSeed + 44;
    const N = Math.max(nmin, 7);
    const baseTs = 1600000300000;
    const sizes = [];
    // create some small, some large to hover around maxBytes
    for(let i=0;i<N;i++) sizes.push( i%3===0 ? Math.floor(maxBytes*0.5) : Math.floor(maxBytes*0.2) );
    const s = synthesize(seed, N, Math.min(3, maxUsers), baseTs, sizes);
    templates.push(mk('Mixed sizes: barely exceed', s.lines, ['boundary','adversarial'], { max_bytes: maxBytes }));
  })();

  // Template: interleaved users to test isolation
  (function(){
    const seed = baseSeed + 55;
    const N = Math.max(nmin, 10);
    const baseTs = 1600000400000;
    const sizes = [];
    for(let i=0;i<N;i++) sizes.push( (i%2===0) ? Math.floor(maxBytes*0.4) : Math.floor(maxBytes*0.3) );
    const s = synthesize(seed, N, Math.min(4, maxUsers), baseTs, sizes);
    templates.push(mk('Interleaved users (isolation)', s.lines, ['isolation','multi-user'], { max_bytes: maxBytes }));
  })();

  // Template: minimal cases
  (function(){
    const seed = baseSeed + 66;
    const baseTs = 1600000500000;
    const a = synthesize(seed, 1, 1, baseTs, [Math.min(1, Math.floor(maxBytes*0.5))]);
    const b = synthesize(seed+1, 2, 1, baseTs+1000, [Math.floor(maxBytes*0.6), Math.floor(maxBytes*0.5)]);
    templates.push(mk('Minimal cases (1,2 events)', a.lines.concat(b.lines), ['sanity']));
  })();

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
  } else if (tagset.includes('events') || tagset.includes('event') || tagset.includes('streams')){
    pool = generateEventTemplates(constraints, opts);
  } else if (tagset.includes('strings') || tagset.includes('string')){
    pool = generateStringTemplates(constraints, opts);
  } else if (tagset.includes('binary search') || tagset.includes('binary-search')){
    // binary search templates assume sorted arrays
    pool = generateBinarySearchTemplates(constraints, opts);
  } else {
    pool = generateArrayTemplates(constraints, opts);
  }

  // At this point we have `pool` of raw templates. We'll canonicalize, dedup, enrich metadata, then curate.
  // Helper: produce full content for saving/export
  function fullContentFor(item) {
    if (item.template === 'array') {
      if (problem.input_shape === 'multi') {
        const T = 1;
        return [T, item.params.N + '\n' + item.content].join('\n');
      }
      return item.params.N + '\n' + item.content;
    }
    return item.content;
  }


  // Dedup: keep first occurrence deterministically
  // Canonicalization: produce stable key and normalized object
  function canonicalizeTestcase(item, problemTags) {
    const t = item.template;
    let key = '';
    let normalized = { template: item.template, params: item.params, content: item.content };

    if (item.template === 'graph') {
      // parse lines: first line n m followed by edges
      const lines = item.content.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
      const header = lines[0] || '';
      const parts = header.split(/\s+/);
      const n = parts[0] || '0';
      const m = parts[1] || (lines.length-1).toString();
      const edges = [];
      for (let i=1;i<lines.length;i++){
        const p = lines[i].split(/\s+/).map(x=>x.trim()).filter(Boolean);
        if (p.length>=2) edges.push([Number(p[0]), Number(p[1])]);
      }
      // determine directed flag from constraints if present
      const directed = (problemTags && problemTags.includes('directed')) || (item.params && item.params.directed) || false;
      const normEdges = edges.map(e => directed ? [e[0], e[1]] : [Math.min(e[0],e[1]), Math.max(e[0],e[1])]);
      normEdges.sort((a,b)=> a[0]-b[0] || a[1]-b[1]);
      // remove exact duplicates
      const uniq = [];
      const seenE = new Set();
      for(const e of normEdges){
        const s = e[0] + '-' + e[1];
        if (!seenE.has(s)) { seenE.add(s); uniq.push(e); }
      }
      const edgesJoined = uniq.map(e=>e[0]+'-'+e[1]).join('|');
      key = `graph:${n}:${uniq.length}:${directed? 'D' : 'U'}:${edgesJoined}`;
      normalized = { n: Number(n), m: uniq.length, edges: uniq, directed };
    } else if (item.template === 'array' || item.template === 'binary_search'){
      // array-like content: first part may be N then values
      const content = item.content.trim();
      // try to extract array and target for binary_search
      if (item.template === 'binary_search'){
        const parts = content.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
        let arr = [];
        let target = '';
        if (parts.length>=2){
          if (parts[0].match(/^\d+$/) && parts[1].indexOf(' ')>=0){
            arr = parts[1].split(/\s+/).map(x=>x.trim()).filter(Boolean).map(Number);
            target = parts[2] || parts[1].split(/\s+/).pop();
          } else {
            // fallback: content contains array then target
            const all = content.split(/\s+/).map(x=>x.trim()).filter(Boolean);
            if (all.length>=2){
              arr = all.slice(0, all.length-1).map(Number);
              target = all[all.length-1];
            }
          }
        }
        const arrJoined = arr.join(',');
        key = `binary_search:${arr.length}:${arrJoined}:target=${target}`;
        normalized = { array: arr, target };
      } else {
        // array template: try to parse N then values
        const parts = content.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
        let arrVals = [];
        if (parts.length===1 && parts[0].indexOf(' ')>=0){
          arrVals = parts[0].split(/\s+/).map(x=>x.trim()).filter(Boolean);
        } else if (parts.length>=2 && parts[0].match(/^\d+$/)){
          arrVals = parts[1].split(/\s+/).map(x=>x.trim()).filter(Boolean);
        } else {
          // fallback: split all
          arrVals = content.split(/\s+/).map(x=>x.trim()).filter(Boolean);
        }
        const joined = arrVals.join(',');
        key = `array:${arrVals.length}:${joined}`;
        normalized = { values: arrVals.map(v=>isNaN(v)?v:Number(v)) };
      }
    } else if (item.template === 'string'){
      const s = item.content || '';
      key = `string:${s.length}:${s}`;
      normalized = { str: s };
    } else if (item.template === 'events'){
      // content lines: timestamp user payload
      const lines = item.content.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
      // default: sort by timestamp for canonical key
      const parsed = lines.map(l=>{
        const p = l.split(/\s+/);
        return { ts: Number(p[0]), user: p[1], payload: p.slice(2).join(' ') };
      });
      parsed.sort((a,b)=> a.ts - b.ts || a.user.localeCompare(b.user));
      const joined = parsed.map(p=>`${p.ts},${p.user},${p.payload}`).join('|');
      key = `events:${parsed.length}:${joined}`;
      normalized = { events: parsed };
    } else {
      // fallback generic
      const h = crypto.createHash('sha1').update(item.content || '').digest('hex').slice(0,12);
      key = `generic:${item.template || 'unk'}:${h}`;
      normalized = { content: item.content };
    }

    return { key, normalized };
  }
  function dedupByCanonical(poolItems){
    const seen = new Set();
    const out = [];
    for(const item of poolItems){
      const c = canonicalizeTestcase(item, (problem.tags||[]).map(t=>t.toLowerCase()));
      if (!seen.has(c.key)){
        seen.add(c.key);
        // attach canonical key and normalized form
        out.push(Object.assign({}, item, { canonical_key: c.key, canonical_normalized: c.normalized }));
      }
    }
    return out;
  }

  // Enrich metadata with standardized fields
  function enrichMeta(item){
    const out = Object.assign({}, item);
    // ensure category
    const cat = (item.category || (item.targets && item.targets.includes('performance') ? 'performance' : (item.targets && item.targets.length>0 ? item.targets[0] : 'core'))).toString().toLowerCase();
    out.category = cat;
    // template name
    out.template = item.template || item.template_name || out.template;
    out.template_name = item.name || item.template_name || out.template_name || out.template;
    // targets
    out.targets = item.targets || [];
    // size bucket
    const n = (item.params && item.params.N) || (item.params && item.params.n) || 0;
    out.size_bucket = n <= 3 ? 'small' : (n <= 50 ? 'medium' : 'large');
    // difficulty score heuristic
    out.difficulty_score = out.size_bucket === 'small' ? 1 : (out.size_bucket === 'medium' ? 2 : 3);
    // explanation
    out.explanation = item.explain || item.template_explain || item.name || generateExplanation(out);
    // ensure full content present
    out.content = fullContentFor(item);
    return out;
  }

  function generateExplanation(item){
    if (item.targets && item.targets.length>0){
      const t = item.targets[0];
      if (t === 'connectivity') return 'Breaks solutions that assume the graph is connected.';
      if (t === 'degenerate') return 'Tests base case handling with minimal input.';
      if (t === 'performance') return 'Stresses worst-case time complexity with dense structure.';
      if (t === 'duplicates') return 'Targets incorrect handling of duplicate values.';
      if (t === 'ordering') return 'Targets incorrect handling of ordering or out-of-order events.';
      if (t === 'boundary') return 'Targets off-by-one at boundary conditions.';
      if (t === 'random') return 'Random deterministic case for robustness.';
    }
    return item.template_name || item.name || 'Representative testcase.';
  }

  // Curator: group by category and select representative set deterministically
  function curate(uniquePool, problem, optsLocal){
    const desired = Math.max(1, Math.min(optsLocal.count || 10, 50));
    // quotas per category (defaults)
    const baseQuotas = { degenerate:1, boundary:2, connectivity:2, duplicates:1, ordering:1, performance:1, core:2 };
    // adapt for graphs
    const tagset = (problem.tags||[]).map(t=>t.toLowerCase());
    if (tagset.includes('graphs') || tagset.includes('graph')){
      baseQuotas.connectivity = 2; baseQuotas.performance = 1; baseQuotas.core = 2;
    }

    // group
    const groups = {};
    for(const it of uniquePool){
      const e = enrichMeta(it);
      const cat = e.category || 'core';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(e);
    }

    // deterministic ranking function
    function rankCandidates(arr){
      return arr.map(a=>{
        const targetCount = (a.targets||[]).length;
        const sizeScore = (a.size_bucket==='small'?2: a.size_bucket==='medium'?1:0);
        const perfBoost = a.targets && a.targets.includes('performance') ? 10 : 0;
        const score = targetCount*5 + sizeScore + perfBoost;
        return { item: a, score };
      }).sort((x,y)=>{ if (y.score!==x.score) return y.score - x.score; // higher score first
        // tiebreaker stable by canonical key
        const kx = x.item.canonical_key || ''; const ky = y.item.canonical_key || '';
        return kx < ky ? -1 : (kx > ky ? 1 : 0);
      });
    }

    // select
    const curated = [];
    const categoriesOrder = ['degenerate','boundary','duplicates','ordering','connectivity','performance','core'];
    let totalSelected = 0;
    for(const cat of categoriesOrder){
      const bucket = groups[cat] || [];
      if (bucket.length===0) continue;
      const ranked = rankCandidates(bucket);
      const quota = baseQuotas[cat] || 1;
      for(let i=0;i<Math.min(quota, ranked.length); i++){
        curated.push(ranked[i].item);
        totalSelected++;
        if (totalSelected>=desired) break;
      }
      if (totalSelected>=desired) break;
    }

    // fill remaining from other groups deterministically
    if (totalSelected < desired){
      // collect remaining candidates
      const rem = [];
      for(const cat in groups){
        const ranked = rankCandidates(groups[cat]);
        for(const r of ranked) rem.push(r);
      }
      // remove already selected
      const selKeys = new Set(curated.map(c=>c.canonical_key));
      const remFiltered = rem.filter(r=>!selKeys.has(r.item.canonical_key));
      remFiltered.sort((a,b)=>{ if (b.score!==a.score) return b.score - a.score; const ka=a.item.canonical_key||''; const kb=b.item.canonical_key||''; return ka<kb?-1:(ka>kb?1:0); });
      for(const r of remFiltered){
        curated.push(r.item); totalSelected++; if (totalSelected>=desired) break;
      }
    }

    // final ordering: categories fixed order then by canonical key
    curated.sort((a,b)=>{
      const ia = categoriesOrder.indexOf(a.category||'core');
      const ib = categoriesOrder.indexOf(b.category||'core');
      if (ia!==ib) return ia-ib;
      const ka = a.canonical_key||''; const kb = b.canonical_key||'';
      return ka < kb ? -1 : (ka > kb ? 1 : 0);
    });

    return curated;
  }

  // pipeline
  const raw = pool;
  const unique = dedupByCanonical(raw);
  // by default return curated suite unless mode=raw
  if (opts.mode === 'raw'){
    return unique.map(u=>{
      const enriched = enrichMeta(u);
      return Object.assign({}, enriched, { canonical_key: u.canonical_key });
    });
  }

  const curated = curate(unique, { tags: tags, constraints: constraints }, opts);
  return curated.map(c=>({
    template_id: c.template_id || c.template_id || null,
    template_name: c.template_name || c.template || c.template_name || c.name,
    template_explain: c.template_explain || c.explain || c.explanation,
    template_preview: c.template_preview || c.preview || (c.content||'').slice(0,80),
    category: c.category,
    targets: c.targets,
    params: c.params,
    content: c.content,
    canonical_key: c.canonical_key
  }));
}

module.exports = { generateTestcases, canonicalizeTestcase: function(t){ return canonicalizeTestcase(t, []); } };
