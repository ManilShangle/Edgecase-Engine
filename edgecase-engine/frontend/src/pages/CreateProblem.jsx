import React, { useState } from 'react'
import { createProblem } from '../api'
import { useNavigate } from 'react-router-dom'

const TAGS = ['arrays','strings','math','greedy','dp','graphs','trees','binary search','two pointers','prefix sums','bitmask','combinatorics','geometry','hashing','simulation','data structures']

export default function CreateProblem(){
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState([])
  const [nmin, setNmin] = useState(1)
  const [nmax, setNmax] = useState(5)

  async function save(){
    // ensure guest exists
    let guest = localStorage.getItem('edgecase_guest')
    if(!guest){
      const g = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:4000') + '/api/guest', { method: 'POST' }).then(r=>r.json())
      guest = g.guest_id
      localStorage.setItem('edgecase_guest', guest)
    }
    const p = await createProblem({ title, tags, constraints: { n_min: Number(nmin), n_max: Number(nmax) }, owner_type: 'guest', owner_id: guest })
    nav('/library')
  }

  function toggleTag(t){
    setTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])
  }

  return (
    <div>
      <h2>Create Problem</h2>
      <div style={{maxWidth:600}}>
        <label>Problem Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',padding:8,margin:'6px 0'}} />

        <label>Tags</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {TAGS.map(t=> (
            <button key={t} onClick={()=>toggleTag(t)} style={{padding:6, background: tags.includes(t)? '#ddd':'#f7f7f7' }}>{t}</button>
          ))}
        </div>

        <div style={{marginTop:12}}>
          <label>N min</label>
          <input type="number" value={nmin} onChange={e=>setNmin(e.target.value)} style={{width:120, marginLeft:8}} />
          <label style={{marginLeft:12}}>N max</label>
          <input type="number" value={nmax} onChange={e=>setNmax(e.target.value)} style={{width:120, marginLeft:8}} />
        </div>

        <div style={{marginTop:12}}>
          <button onClick={save} style={{padding:'8px 16px'}}>Save Problem</button>
        </div>
      </div>
    </div>
  )
}
