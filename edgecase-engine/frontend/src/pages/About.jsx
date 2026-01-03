import React from 'react'

export default function About(){
  return (
    <div className="page-center">
      <div className="hero-card card">
        <h2 style={{marginTop:0}}>About EdgeCase Engine</h2>

        <p className="lead">EdgeCase Engine helps authors, competitors, and engineers quickly generate focused test inputs that surface tricky edge-cases for algorithmic problems. Instead of guessing inputs, you provide simple constraints and the tool produces diverse, targeted examples to validate correctness and assumptions.</p>

        <h3>How it works (simple)</h3>
        <p className="small-muted">You describe a problem with tags and a few constraints (sizes, value ranges, graph limits). The generator uses deterministic templates to produce inputs that stress boundaries, duplicates, ordering, and performance cases. Preview first, then save or export the ones you want.</p>

        <h3>Why judges and teams care</h3>
        <ul>
          <li>Speeds up test-case creation for contest problems and internal QA.</li>
          <li>Finds subtle failures (overflows, off-by-one, incorrect assumptions) before they reach users.</li>
          <li>Produces deterministic, reproducible inputs for debugging and regression tests.</li>
        </ul>

        <h3>Real uses</h3>
        <ul>
          <li>Competition problem setters: quickly build strong sample datasets.</li>
          <li>Engineers/QA: generate focused test inputs for algorithmic modules.</li>
          <li>Educators: create illustrative edge-case examples for teaching.</li>
        </ul>

        <div style={{marginTop:16, textAlign:'center'}}>
          <button className="button primary" onClick={()=>window.location.href='/create'}>Try it — create a problem</button>
        </div>
      </div>
    </div>
  )
}
