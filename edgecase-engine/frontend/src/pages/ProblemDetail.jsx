import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProblem, listTestcases, exportProblem, createTestcase } from '../api'
import GenerateModal from '../components/GenerateModal'
import TestcaseList from '../components/TestcaseList'
import ManualAdd from '../components/ManualAdd'
import ExportModal from '../components/ExportModal'

export default function ProblemDetail(){
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [testcases, setTestcases] = useState([])
  const [showGen, setShowGen] = useState(false)
  const [showExport, setShowExport] = useState(false)

  useEffect(()=>{
    getProblem(id).then(d=>setProblem(d.problem)).catch(()=>setProblem(null))
    loadCases()
  },[id])

  function loadCases(){
    listTestcases(id).then(setTestcases).catch(()=>setTestcases([]))
  }

  function computeAnalytics(data){
    const byCat = {}
    const targetCounts = {}
    const arr = Array.isArray(data) ? data : []
    arr.forEach(t=>{
      byCat[t.category] = (byCat[t.category]||0) + 1
      const tlist = Array.isArray(t.targets) ? t.targets : (t.targets ? [t.targets] : [])
      tlist.forEach(tt=> { targetCounts[tt] = (targetCounts[tt]||0)+1 })
    })
    const topTargets = Object.entries(targetCounts).sort((a,b)=>b[1]-a[1]).slice(0,6)
    return { byCat, topTargets }
  }

  async function addManual(name, content){
    try{
      await createTestcase(id, { name, content, category: 'Manual', owner_type: 'guest', owner_id: localStorage.getItem('edgecase_guest') })
      loadCases()
      alert('Saved')
    }catch(err){ console.error(err); alert('Save failed') }
  }

  function riskChecklist(p){
    if(!p) return []
    const c = p.constraints || {}
    const risks = []
    if(c.values_max && c.values_max > 1e9) risks.push('overflow risk')
    if(c.allow_negatives) risks.push('negative handling risk')
    if(c.allow_duplicates) risks.push('duplicate edge risk')
    if(p.input_shape === 'multi') risks.push('reset between tests risk')
    if(c.graph && c.graph.edges_max && c.graph.edges_max > ( (c.graph.nodes_max||0) * (c.graph.nodes_max||0) / 4 )) risks.push('performance risk')
    if(c.sorted_input) risks.push('assumption risk if not guaranteed')
    return risks
  }

  function renderConstraints(c){
    if(!c) return '—'
    const parts = []
    if(c.graph){
      const nodes = c.graph.nodes_max || c.graph.nodes || 'N/A'
      const edges = c.graph.edges_max || c.graph.edges || 'N/A'
      parts.push(`graph: nodes≤${nodes}, edges≤${edges}`)
    }
    if(c.n_min != null || c.n_max != null) parts.push(`n: ${c.n_min ?? '?'}–${c.n_max ?? '?'}`)
    if(c.values_min != null || c.values_max != null) parts.push(`values: ${c.values_min ?? '?'}–${c.values_max ?? '?'}`)
    const flags = []
    if(c.allow_negatives) flags.push('negatives')
    if(c.allow_duplicates) flags.push('duplicates')
    if(c.sorted_input) flags.push('sorted')
    if(flags.length) parts.push(flags.join(', '))
    return parts.length ? parts.join(' • ') : '—'
  }

  async function doExport(){
    try{
      const blob = await exportProblem(id, { comments: true })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${problem ? problem.title.replace(/\s+/g,'_') : 'export'}.txt`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    }catch(err){
      console.error(err)
      alert('Export failed')
    }
  }

  const analytics = computeAnalytics(testcases)

  return (
    <div>
      <h2>Problem Workspace</h2>
      {problem ? (
        <div style={{display:'flex',gap:20}}>
          <div style={{width:320}}>
            <div className="card card-muted">
              <h3>{problem.title}</h3>
              <div className="small-muted">Tags: {problem.tags && problem.tags.join(', ')}</div>
              <div style={{marginTop:8}} className="small-muted">Source: {problem.source} • Difficulty: {problem.difficulty}</div>
              <div style={{marginTop:8}} className="small-muted">Constraints: {renderConstraints(problem.constraints)}</div>
              <div style={{marginTop:12}}>
                <button onClick={()=>setShowGen(true)} className="button" style={{marginRight:8}}>Generate Edge Cases</button>
                <button onClick={()=>setShowExport(true)} className="button">Export</button>
              </div>
            </div>

            <div style={{marginTop:12}} className="card">
              <h4>Risk Checklist</h4>
              <ul>
                {riskChecklist(problem).map(r=> <li key={r}>{r}</li>)}
              </ul>
            </div>
          </div>

          <div style={{flex:1}}>
            <div style={{display:'flex',gap:12}}>
              <div style={{flex:1}}>
                <TestcaseList problemId={id} onRefresh={loadCases} initial={testcases} />
              </div>
              <div style={{width:280}} className="card">
                <h4>Analytics</h4>
                <div className="small-muted" style={{marginBottom:8}}>Quick summary of testcase categories and common targets to help prioritize checks.</div>
                {Object.keys(analytics.byCat).length === 0 ? (
                  <div className="small-muted">No analytics available</div>
                ) : (
                  <div>
                    <div><strong>Counts:</strong></div>
                    {Object.entries(analytics.byCat).map(([k,v])=> <div key={k}>{k}: {v}</div>)}
                    <div style={{marginTop:8}}><strong>Top targets</strong></div>
                    {analytics.topTargets.map(([t,c])=> <div key={t}>{t}: {c}</div>)}
                  </div>
                )}

                <div style={{marginTop:12}}>
                  <h4>Add Manual Testcase</h4>
                  <ManualAdd onAdd={addManual} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : <div>Loading...</div>}

      {showGen && <GenerateModal problemId={id} onClose={()=>{ setShowGen(false); loadCases() }} />}
      {showExport && <ExportModal problemId={id} onClose={()=>setShowExport(false)} />}
    </div>
  )
}
