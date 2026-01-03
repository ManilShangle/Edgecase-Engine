import React, { useState } from 'react'
import { createProblem, createGuest } from '../api'
import { useNavigate } from 'react-router-dom'

const TAGS = ['arrays','strings','math','greedy','dp','graphs','trees','binary search','two pointers','prefix sums','bitmask','combinatorics','geometry','hashing','simulation','data structures']

export default function CreateProblem(){
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState([])
  const [nmin, setNmin] = useState(1)
  const [nmax, setNmax] = useState(5)

  async function save(){
    let guest = localStorage.getItem('edgecase_guest')
    if(!guest){
      const g = await createGuest()
      guest = g.guest_id
      localStorage.setItem('edgecase_guest', guest)
    }
    await createProblem({ title, tags, constraints: { n_min: Number(nmin), n_max: Number(nmax) }, owner_type: 'guest', owner_id: guest })
    nav('/library')
  }

  function toggleTag(t){
    setTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])
  }

  return (
    <div className="page-center">
      <div className="card form-card">
        <h2 style={{marginTop:0}}>Create Problem</h2>

        <label>Problem Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} className="input" style={{margin:'6px 0'}} />

        <label>Tags</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:8, marginTop:6}}>
          {TAGS.map(t=> (
            <button key={t} onClick={()=>toggleTag(t)} className="button" style={{padding:'6px 10px', background: tags.includes(t)? 'rgba(74,163,255,0.06)':'transparent' }}>{t}</button>
          ))}
        </div>

        <div style={{marginTop:14, display:'flex', alignItems:'center', gap:12}}>
          <div>
            <label htmlFor="nmin">N min</label>
            <input id="nmin" type="number" min={1} value={nmin} onChange={e=>setNmin(Number(e.target.value)||0)} className="input" style={{width:140, marginLeft:8}} placeholder="min" aria-label="N min" />
          </div>
          <div>
            <label htmlFor="nmax">N max</label>
            <input id="nmax" type="number" min={1} value={nmax} onChange={e=>setNmax(Number(e.target.value)||0)} className="input" style={{width:140, marginLeft:8}} placeholder="max" aria-label="N max" />
          </div>
        </div>

        <div style={{marginTop:8}}>
          <div className="small-muted">Expected input size range — used to generate varied test sizes (e.g. 1–1000).</div>
          {Number(nmin) > Number(nmax) && <div className="small-muted" style={{color:'rgba(255,150,150,0.9)', marginTop:6}}>Warning: N min should be less than or equal to N max.</div>}
        </div>

        <div style={{marginTop:18, textAlign:'center'}}>
          <button onClick={save} className="button primary">Save Problem</button>
        </div>
      </div>
    </div>
  )
}
