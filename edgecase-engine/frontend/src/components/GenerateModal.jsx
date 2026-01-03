import React, { useEffect, useState } from 'react'
import { generate, saveBulk } from '../api'

export default function GenerateModal({ problemId, onClose }){
  const [count, setCount] = useState(15)
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(new Set())

  async function doGenerate(){
    const res = await generate(problemId, { count, seed: Date.now() % 100000 })
    setItems(res.generated || [])
    setSelected(new Set((res.generated || []).map((_,i)=>i)))
  }

  useEffect(()=>{ doGenerate() }, [])

  function toggle(i){
    const s = new Set(selected)
    if(s.has(i)) s.delete(i); else s.add(i)
    setSelected(s)
  }

  async function saveSelected(){
    const toSave = Array.from(selected).map(i=>items[i]).map(it=>({ owner_type: 'guest', owner_id: localStorage.getItem('edgecase_guest'), template_name: it.template_name, template_id: it.template_id, category: it.category, targets: it.targets, params: it.params, content: it.content }))
    await saveBulk(problemId, toSave)
    alert('Saved '+toSave.length+' testcases')
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <h3>Generate Edge Cases</h3>
        <div className="flex" style={{alignItems:'center',gap:8}}>
          <label>How many:</label>
          <input type="range" min={5} max={50} value={count} onChange={e=>setCount(Number(e.target.value))} />
          <span className="small-muted">{count}</span>
          <button className="button" onClick={doGenerate} style={{marginLeft:12}}>Regenerate</button>
        </div>

        <div style={{marginTop:12}}>
          {items.length===0 && <div className="small-muted">Generating...</div>}
          {items.map((it, i)=> (
            <div key={i} className="card" style={{marginBottom:6}}>
              <label><input type="checkbox" checked={selected.has(i)} onChange={()=>toggle(i)} /> <strong>{it.template_name}</strong> • <span className="small-muted">{it.targets && it.targets.join(', ')}</span></label>
              <pre className="data-text" style={{marginTop:6}}>{it.content}</pre>
            </div>
          ))}
        </div>

        <div style={{marginTop:12}}>
          <button className="button primary" onClick={saveSelected} style={{marginRight:8}}>Save Selected</button>
          <button className="button ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
