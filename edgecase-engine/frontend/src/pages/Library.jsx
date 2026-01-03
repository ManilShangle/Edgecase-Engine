import React, { useEffect, useState } from 'react'
import { listProblems, seedSamples } from '../api'
import { Link } from 'react-router-dom'

export default function Library(){
  const [problems, setProblems] = useState([])

  useEffect(()=>{
    const guest = localStorage.getItem('edgecase_guest')
    listProblems(guest).then(setProblems).catch(()=>setProblems([]))
  },[])

  return (
    <div>
      <h2>Library</h2>
      <div style={{marginBottom:12}}>
        <button onClick={async ()=>{ const res = await seedSamples(); localStorage.setItem('edgecase_guest', res.guest_id); const g = localStorage.getItem('edgecase_guest'); listProblems(g).then(setProblems); }}>Load Sample Problems</button>
      </div>
      <div>
        {problems.length===0 && <div>No problems yet. Create one.</div>}
        {problems.map(p=> (
          <div key={p._id} className="card" style={{marginBottom:8}}>
            <strong><Link to={`/problems/${p._id}`}>{p.title}</Link></strong>
            <div className="small-muted">Tags: {p.tags && p.tags.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
