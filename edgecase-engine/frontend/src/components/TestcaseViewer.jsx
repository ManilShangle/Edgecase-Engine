import React, { useState } from 'react'
import { updateTestcase } from '../api'

export default function TestcaseViewer({ testcase, onClose, onSaved }){
  const [found, setFound] = useState(testcase.found_bug || false)
  const [failure, setFailure] = useState(testcase.failure_type || 'unknown')
  const [note, setNote] = useState(testcase.bug_note || '')
  const [expected, setExpected] = useState(testcase.expected_output || '')

  async function save(){
    const payload = { found_bug: found, failure_type: failure, bug_note: note, expected_output: expected }
    try{
      await updateTestcase(testcase._id, payload)
      if(onSaved) onSaved()
      onClose()
    }catch(err){
      console.error(err)
      alert('Save failed')
    }
  }

  function copyContent(){
    navigator.clipboard.writeText(testcase.content).then(()=>alert('Copied to clipboard')).catch(()=>alert('Copy failed'))
  }

  function download(){
    const blob = new Blob([testcase.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (testcase.name || 'testcase') + '.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <h3>{testcase.name}</h3>
        <div className="small-muted">Category: {testcase.category} • Targets: {testcase.targets && testcase.targets.join(', ')}</div>
        <div style={{marginTop:12}}>
          <pre className="data-text">{testcase.content}</pre>
        </div>

        <div style={{marginTop:12,display:'flex',gap:8}}>
          <button className="button" onClick={copyContent}>Copy</button>
          <button className="button" onClick={download}>Download</button>
        </div>

        <div style={{marginTop:12,borderTop:'1px solid var(--border)',paddingTop:12}}>
          <label><input type="checkbox" checked={found} onChange={e=>setFound(e.target.checked)} /> Mark as found bug</label>
          <div style={{marginTop:8}}>
            <label>Failure type: </label>
            <select value={failure} onChange={e=>setFailure(e.target.value)}>
              <option value="unknown">unknown</option>
              <option value="WA">WA</option>
              <option value="TLE">TLE</option>
              <option value="MLE">MLE</option>
              <option value="RE">RE</option>
              <option value="parsing">parsing</option>
            </select>
          </div>
          <div style={{marginTop:8}}>
            <label>Bug note</label>
            <input value={note} onChange={e=>setNote(e.target.value)} className="input" />
          </div>
          <div style={{marginTop:8}}>
            <label>Expected output (optional)</label>
            <textarea value={expected} onChange={e=>setExpected(e.target.value)} className="input" style={{minHeight:80}} />
          </div>

          <div style={{marginTop:12}}>
            <button className="button primary" onClick={save} style={{marginRight:8}}>Save</button>
            <button className="button ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
