import React, { useEffect, useState } from 'react'
import { listProblems } from '../api'

export default function Library(){
  const [problems, setProblems] = useState([])

  useEffect(()=>{
    const guest = localStorage.getItem('edgecase_guest')
    listProblems(guest).then(setProblems).catch(()=>setProblems([]))
  },[])

  return (
    <div>
      <h2>Library</h2>
      <div>
        {problems.length===0 && <div>No problems yet. Create one.</div>}
        {problems.map(p=> (
          <div key={p._id} style={{border:'1px solid #eee', padding:8, marginBottom:8}}>
            <strong>{p.title}</strong>
            <div style={{color:'#666'}}>Tags: {p.tags && p.tags.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
