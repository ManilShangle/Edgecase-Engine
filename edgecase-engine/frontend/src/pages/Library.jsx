import React, { useEffect, useState } from 'react'
import { listProblems, seedSamples, generate, saveBulk, exportProblem, deleteProblem } from '../api'

function downloadBlob(blob, filename){
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'export.txt'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export default function Library(){
  const [problems, setProblems] = useState([])
  const [stateMap, setStateMap] = useState({})

  useEffect(()=>{
    const guest = localStorage.getItem('edgecase_guest')
    listProblems(guest).then(setProblems).catch(()=>setProblems([]))
    setStateMap({})
  },[])

  const reload = ()=>{
    const guest = localStorage.getItem('edgecase_guest')
    listProblems(guest).then(setProblems).catch(()=>setProblems([]))
    // clear transient row state (errors/loading) when reloading
    setStateMap({})
  }

  const handleSeed = async ()=>{
    const res = await seedSamples()
    localStorage.setItem('edgecase_guest', res.guest_id)
    // reload and clear any transient error states
    reload()
    setStateMap({})
  }

  const setRowState = (id, patch)=> setStateMap(s=>({...s,[id]:{...(s[id]||{}),...patch}}))

  const handleGenerate = async (p)=>{
    setRowState(p._id, { loading: true, generated: null, error: null })
    try{
      const genResp = await generate(p._id, { count: 8 })
      // normalize response: API returns { generated: [...] }
      const gen = Array.isArray(genResp) ? genResp : (genResp.generated || [])
      // auto-save generated testcases
      setRowState(p._id, { loading: false, generated: gen, saving: true })
      const tcs = gen.map((g,i)=>({
        name: `${p.title} - ${i+1}`,
        content: g.content,
        targets: g.targets || [],
        problem_id: p._id
      }))
      await saveBulk(p._id, tcs)
      setRowState(p._id, { saving: false, saved: true })
      // reload list to refresh metadata if needed
      reload()
    }catch(err){
      setRowState(p._id, { loading: false, saving: false, error: null })
    }
  }

  const handleExport = async (p)=>{
    setRowState(p._id, { exporting: true })
    try{
      const blob = await exportProblem(p._id, { comments: true })
      downloadBlob(blob, `${p.title.replace(/\s+/g,'_')}.txt`)
      setRowState(p._id, { exporting: false })
    }catch(err){
      setRowState(p._id, { exporting: false, error: null })
    }
  }

  const handleDelete = async (p)=>{
    if(!window.confirm('Delete this problem and its testcases?')) return
    setRowState(p._id, { deleting: true })
    try{
      await deleteProblem(p._id)
      setRowState(p._id, { deleting: false })
      reload()
    }catch(err){
      setRowState(p._id, { deleting: false, error: null })
    }
  }

  return (
    <div>
      <h2>Library</h2>
      <div style={{marginBottom:12}}>
        <button onClick={handleSeed}>Load Sample Problems</button>
      </div>
      <div>
        {problems.length===0 && <div>No problems yet. Create one.</div>}
        {problems.map(p=> {
          const s = stateMap[p._id] || {}
          return (
            <div key={p._id} className="card" style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:600}}>{p.title}</div>
                  <div className="small-muted">{p.primary_ds ? `Primary: ${p.primary_ds}` : ''} {p.tags && p.tags.length>0 ? ` • ${p.tags.join(', ')}` : ''}</div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>handleGenerate(p)} disabled={s.loading || s.saving}>{
                    s.loading ? 'Generating...' : s.saving ? 'Saving...' : s.saved ? 'Saved' : 'Generate'
                  }</button>
                  <button onClick={()=>handleExport(p)} disabled={s.exporting}>{s.exporting ? 'Exporting...' : 'Export'}</button>
                  <button onClick={()=>handleDelete(p)} disabled={s.deleting} style={{color:'#900'}}> {s.deleting ? 'Deleting...' : 'Delete'}</button>
                </div>
              </div>

              {s.error && <div className="small-muted" style={{color:'#900'}}>{s.error}</div>}

              {s.generated && (
                <div style={{marginTop:8}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:6}}>Preview ({s.generated.length})</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {s.generated.slice(0,6).map((g,idx)=> (
                      <div key={idx} className="card small-muted" style={{padding:8, minWidth:160}}>
                        <div style={{fontWeight:600}}>{g.template_name || g.template_id}</div>
                        <div style={{fontSize:12}}>{g.template_preview || g.content}</div>
                        {g.template_explain && <div className="small-muted" style={{fontSize:11,marginTop:6}}>{g.template_explain}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
