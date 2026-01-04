import React from 'react'

export default function HowItWorks(){
  return (
    <div className="page-center">
      <div className="hero-card card about-card">
        <h1 className="about-title">How EdgeCase Engine Works</h1>

        <h2 className="about-heading">Problem definition</h2>
        <p className="about-text">The generator consumes a precise problem definition, not just UI labels. Required elements:</p>
        <ul className="about-list">
          <li>Metadata: title, tags, and structure type (array, graph, stream).</li>
          <li>Size and value constraints (min/max, N limits, ranges).</li>
          <li>Risk signals: duplicates, boundaries, ordering requirements.</li>
        </ul>

        <h2 className="about-heading">Deterministic template selection</h2>
        <p className="about-text">The generator picks from a curated set of deterministic templates rather than producing random fuzz. Templates encode known failure modes and are applied with a seed so results are reproducible.</p>

        <h2 className="about-heading">Testcase construction</h2>
        <p className="about-text">Each template is instantiated into a compact, readable testcase that:</p>
        <ul className="about-list">
          <li>Respects the user-defined constraints.</li>
          <li>Targets a single incorrect assumption (indexing, ordering, deduplication, etc.).</li>
          <li>Is intentionally composed — values and ordering are chosen to trigger the targeted failure.</li>
        </ul>

        <h2 className="about-heading">Preview vs persistence</h2>
        <p className="about-text">Previews are temporary, for inspection. Persisted cases are saved for reuse and regression testing. MongoDB stores the problem definition, generator configuration (templates + seed), and generated cases.</p>

        <h2 className="about-heading">Export and reuse</h2>
        <p className="about-text">Cases can be exported as plaintext, re-run deterministically, or embedded directly into test harnesses and debugging sessions.</p>

        <div className="about-cta">
          <button className="button primary" onClick={()=>window.location.href='/create'}>Create a problem</button>
        </div>
      </div>
    </div>
  )
}
