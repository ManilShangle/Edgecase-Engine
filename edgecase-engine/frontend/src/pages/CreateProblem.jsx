import React, { useState, useEffect } from 'react'
import { createProblem, createGuest } from '../api'
import { useNavigate } from 'react-router-dom'

const TAG_CATEGORIES = {
  'Data types': ['arrays','strings','matrices'],
  'Algorithms': ['greedy','dp','binary search','two pointers','prefix sums'],
  'Structures': ['graphs','trees'],
  'Techniques': ['hashing','bitmask','combinatorics','geometry'],
  'Other': ['simulation','data structures']
}

const PRIMARY_STRUCTURES = ['Array','String','Matrix','Graph','Tree','Stream / events','Custom']

export default function CreateProblem(){
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [primary, setPrimary] = useState('Array')
  const [tags, setTags] = useState([])

  // size and constraint state
  const [nmin, setNmin] = useState(0)
  const [nmax, setNmax] = useState(1000)
  const [valuesMin, setValuesMin] = useState(null)
  const [valuesMax, setValuesMax] = useState(null)
  const [indexing, setIndexing] = useState('0-based')
  const [allowDuplicates, setAllowDuplicates] = useState(true)
  const [allowEmpty, setAllowEmpty] = useState(false)
  const [sortedInput, setSortedInput] = useState('sometimes')

  // collapsible sections
  const [showConstraints, setShowConstraints] = useState(false)
  const [showRisks, setShowRisks] = useState(false)

  // risk checklist mapped to tags
  const RISK_CHECKS = ['Off-by-one boundaries','Duplicate elements','Ordering assumptions','Overflow / large values','Empty or minimal input','Degenerate structure','Worst-case performance']
  const [risks, setRisks] = useState([])

  useEffect(()=>{
    // smart defaults based on primary structure
    if(primary === 'Array'){
      setNmin(0); setNmax(1000)
    } else if(primary === 'Graph'){
      setNmin(1); setNmax(100)
    } else if(primary === 'String'){
      setNmin(0); setNmax(500)
    } else if(primary === 'Matrix'){
      setNmin(1); setNmax(100)
    } else if(primary === 'Tree'){
      setNmin(1); setNmax(200)
    } else if(primary === 'Stream / events'){
      setNmin(5); setNmax(100)
    }
  },[primary])

  function toggleTag(t){ setTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]) }
  function toggleRisk(r){ setRisks(prev => prev.includes(r) ? prev.filter(x=>x!==r) : [...prev, r]) }

  async function save(){
    try{
      let guest = localStorage.getItem('edgecase_guest')
      if(!guest){
        const g = await createGuest()
        guest = g.guest_id
        localStorage.setItem('edgecase_guest', guest)
      }

      // map risks into tags so generator can pick higher-signal templates
      const riskTags = risks.map(r => 'risk:' + r.toLowerCase().replace(/[^a-z0-9]+/g,'-'))

      const constraints = {
        n_min: Number(nmin),
        n_max: Number(nmax),
        values_min: valuesMin != null ? Number(valuesMin) : undefined,
        values_max: valuesMax != null ? Number(valuesMax) : undefined,
        allow_negatives: (valuesMin != null && valuesMin < 0) ? true : undefined,
        allow_duplicates: allowDuplicates,
        sorted_input: sortedInput === 'always'
      }

      const payload = {
        title,
        notes: summary || undefined,
        primary_ds: primary,
        tags: [...tags, ...riskTags],
        constraints,
        owner_type: 'guest', owner_id: guest
      }

      await createProblem(payload)
      nav('/library')
    }catch(err){ console.error(err); alert('Save failed') }
  }

  return (
    <div className="page-center">
      <div className="card form-card">
        <h2 style={{marginTop:0}}>Create Problem</h2>

        <label>Problem Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} className="input" style={{margin:'6px 0'}} />

        <label>Problem summary (optional)</label>
        <textarea value={summary} onChange={e=>setSummary(e.target.value)} className="input" rows={3} placeholder="Describe the problem in 1–3 sentences. Plain English is fine." />

        <div className="structure-row" style={{marginTop:12}}>
          <div className="main-col">
            <label>Primary input structure</label>
            <select value={primary} onChange={e=>setPrimary(e.target.value)} className="input">
              {PRIMARY_STRUCTURES.map(p=> <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="small-muted" style={{marginTop:6}}>Select the main input shape. This sets sensible defaults.</div>
          </div>

          <div className="size-range-col">
            <label>Input size range</label>
            <div className="range-row" style={{marginTop:6}}>
              <input type="number" className="input" value={nmin} onChange={e=>setNmin(Number(e.target.value)||0)} />
              <input type="number" className="input" value={nmax} onChange={e=>setNmax(Number(e.target.value)||0)} />
            </div>
            <div className="small-muted" style={{marginTop:6}}>Min and max number of primary items. These guide template sizes.</div>
          </div>
        </div>

        <div style={{marginTop:14}}>
          <button className="button" onClick={()=>setShowConstraints(s=>!s)}>{showConstraints ? 'Hide constraints' : 'Show constraints'}</button>
          <button className="button" style={{marginLeft:8}} onClick={()=>setShowRisks(s=>!s)}>{showRisks ? 'Hide risks' : 'Show common failure risks'}</button>
        </div>

        {showConstraints && (
          <div style={{marginTop:12}} className="card">
            <h4>Constraints</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div>
                <label>Value range (min)</label>
                <input type="number" className="input" value={valuesMin ?? ''} onChange={e=>setValuesMin(e.target.value===''? null : Number(e.target.value))} />
              </div>
              <div>
                <label>Value range (max)</label>
                <input type="number" className="input" value={valuesMax ?? ''} onChange={e=>setValuesMax(e.target.value===''? null : Number(e.target.value))} />
              </div>
              <div>
                <label>Indexing</label>
                <select className="input" value={indexing} onChange={e=>setIndexing(e.target.value)}>
                  <option>0-based</option>
                  <option>1-based</option>
                </select>
                <div className="small-muted">Choose indexing convention. Important for off-by-one checks.</div>
              </div>
              <div>
                <label>Can values repeat?</label>
                <select className="input" value={allowDuplicates? 'yes':'no'} onChange={e=>setAllowDuplicates(e.target.value==='yes')}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <div className="small-muted">Duplicates change which templates are important.</div>
              </div>
              <div>
                <label>Can input be empty?</label>
                <select className="input" value={allowEmpty? 'yes':'no'} onChange={e=>setAllowEmpty(e.target.value==='yes')}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label>Are inputs sorted?</label>
                <select className="input" value={sortedInput} onChange={e=>setSortedInput(e.target.value)}>
                  <option value="always">Always</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {showRisks && (
          <div style={{marginTop:12}} className="card">
            <h4>Common failure risks</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {RISK_CHECKS.map(r=> (
                <label key={r} style={{display:'flex',alignItems:'center',gap:8}}>
                  <input type="checkbox" checked={risks.includes(r)} onChange={()=>toggleRisk(r)} /> {r}
                </label>
              ))}
            </div>
            <div className="small-muted" style={{marginTop:8}}>Select risks that apply. These will increase the generator's focus on relevant templates.</div>
          </div>
        )}

        <div style={{marginTop:14}}>
          <label>Problem type (select all that apply)</label>
          <div className="problem-type-grid">
            {Object.entries(TAG_CATEGORIES).map(([cat, list])=> (
              <div key={cat}>
                <div style={{fontWeight:600, marginBottom:6}}>{cat}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {list.map(t=> (
                    <button key={t} onClick={()=>toggleTag(t)} className="button tag-button" style={{padding:'6px 10px', background: tags.includes(t)? 'rgba(74,163,255,0.06)':'transparent' }}>{t}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:18, textAlign:'center'}}>
          <button onClick={save} className="button primary">Save Problem</button>
        </div>
      </div>
    </div>
  )
}
