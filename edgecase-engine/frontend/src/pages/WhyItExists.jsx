import React from 'react'

export default function WhyItExists(){
  return (
    <div className="page-center">
      <div className="hero-card card about-card">
        <h1 className="about-title">Why EdgeCase Engine Exists</h1>

        <h2 className="about-heading">Manual testing misses edge cases</h2>
        <p className="about-text">Teams test main flows first; designing focused edge cases is slower and often skipped. Many production bugs stem from rare input sequences.</p>

        <h2 className="about-heading">Example: rate-limit event processing</h2>
        <p className="about-text">A service ingests events with fields (timestamp_ms, user_id, size). It enforces a per-user rolling 60s window and a max-bytes limit. Events may be out of order or duplicated.</p>

        <h2 className="about-heading">Why this is tricky</h2>
        <ul className="about-list">
          <li>Assuming strict ordering: out-of-order arrivals change window membership.</li>
          <li>Boundary errors: inclusive vs exclusive window bounds affect eviction.</li>
          <li>Missing deduplication: replayed events inflate counts.</li>
          <li>Miscomputed eviction: causes over-throttling or under-protection.</li>
        </ul>

        <h2 className="about-heading">How the tool helps</h2>
        <p className="about-text">From the problem definition the generator produces small, targeted cases that exercise these failure modes. Cases are deterministic, shareable, and ready to drop into tests.</p>

        <h2 className="about-heading">What developers get</h2>
        <ul className="about-list">
          <li>Compact, readable inputs that map to rules.</li>
          <li>Reproducible cases via stored configuration and seed.</li>
          <li>Immediate artifacts for unit and regression tests.</li>
        </ul>

        <p className="about-text">These artifacts make correctness checks concrete and reduce the risk of shipping edge-case failures.</p>
      </div>
    </div>
  )
}
