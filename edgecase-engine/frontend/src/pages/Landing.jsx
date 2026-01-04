import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing(){
  const nav = useNavigate()
  return (
    <div className="landing-hero">
      <div className="hero-card card">
        <h2>Generate targeted edge-case inputs from problem constraints</h2>
        <p className="lead">Quickly produce diverse, focused test inputs to help find edge-case failures and assumptions. The generator does this without running user code.</p>

        <div className="hero-cta">
          <button className="primary button" onClick={()=>nav('/create')}>Create a Problem</button>
          <button className="button" onClick={()=>nav('/library')}>Browse Library</button>
        </div>
      </div>
    </div>
  )
}
