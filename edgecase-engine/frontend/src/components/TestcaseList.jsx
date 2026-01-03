import React, { useEffect, useState } from 'react'
import { listTestcases, updateTestcase, deleteTestcase } from '../api'
import TestcaseViewer from './TestcaseViewer'

export default function TestcaseList({ problemId, onRefresh, initial=[] }){
  const [items, setItems] = useState(initial)
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [targetsFilter, setTargetsFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(()=>{ load() }, [problemId])
  useEffect(()=>{ setItems(initial || []) }, [initial])

  function load(){
    listTestcases(problemId).then(d=>{ setItems(d); }).catch(()=>setItems([]))
  }

  async function togglePin(t){
    await updateTestcase(t._id, { pinned: !t.pinned })
    load()
    if(onRefresh) onRefresh()
  }

  async function doDelete(t){
    if(!confirm('Delete testcase?')) return
    await deleteTestcase(t._id)
    load()
    if(onRefresh) onRefresh()
  }

  const targetTerms = targetsFilter.split(',').map(s=>s.trim()).filter(Boolean)

  const visible = items.filter(it=>{
    if(showPinnedOnly && !it.pinned) return false
    if(categoryFilter !== 'all' && it.category !== categoryFilter) return false
    if(query){
      const q = query.toLowerCase()
      if(!( (it.name||'').toLowerCase().includes(q) || (it.targets||[]).join(' ').toLowerCase().includes(q) || (it.content||'').toLowerCase().includes(q) )) return false
    }
    if(targetTerms.length>0){
      if(!it.targets || !targetTerms.every(t=> it.targets.includes(t))) return false
    }
    return true
  })

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>Testcases ({items.length})</h3>
        <label><input type="checkbox" checked={showPinnedOnly} onChange={e=>setShowPinnedOnly(e.target.checked)} /> Pinned only</label>
      </div>

      <div style={{display:'flex',gap:8,marginTop:8,marginBottom:8}}>
        <input placeholder="Search name, content or targets" value={query} onChange={e=>setQuery(e.target.value)} style={{flex:1,padding:6}} />
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
          <option value="all">All categories</option>
          <option value="Boundary">Boundary</option>
          <option value="Performance">Performance</option>
          <option value="Adversarial">Adversarial</option>
        </select>
        <input placeholder="targets (comma)" value={targetsFilter} onChange={e=>setTargetsFilter(e.target.value)} style={{width:180,padding:6}} />
      </div>

      <div>
        {visible.map(t=> (
          <div key={t._id} className="card" style={{padding:8,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div>
                <a href="#" onClick={(e)=>{ e.preventDefault(); setSelected(t) }}><strong>{t.name}</strong></a> <span style={{color:'#666'}}>• {t.category}</span>
                <div style={{color:'#666'}}>{t.targets && t.targets.join(', ')}</div>
              </div>
              <div>
                <button onClick={()=>togglePin(t)} style={{marginRight:8}}>{t.pinned? 'Unpin':'Pin'}</button>
                <button onClick={()=>doDelete(t)}>Delete</button>
              </div>
            </div>
            <pre style={{whiteSpace:'pre-wrap',marginTop:8}}>{t.content}</pre>
          </div>
        ))}
      </div>

      {selected && <TestcaseViewer testcase={selected} onClose={()=>{ setSelected(null) }} onSaved={()=>{ load(); if(onRefresh) onRefresh() }} />}
    </div>
  )
}
