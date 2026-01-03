import React, { useState } from 'react'
import { exportProblem } from '../api'

export default function ExportModal({ problemId, onClose }){
  const [includeComments, setIncludeComments] = useState(true)
  const [includeT, setIncludeT] = useState(true)
  const [singleFile, setSingleFile] = useState(true)

  async function doExport(){
    try{
      const params = { comments: includeComments, include_T: includeT, single: singleFile }
      const blob = await exportProblem(problemId, params)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export_${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      onClose()
    }catch(err){
      console.error(err)
      alert('Export failed')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel" style={{width:420}}>
        <h3>Export Options</h3>
        <div style={{marginTop:8}}>
          <label><input type="checkbox" checked={includeComments} onChange={e=>setIncludeComments(e.target.checked)} /> Include comments</label>
        </div>
        <div style={{marginTop:8}}>
          <label><input type="checkbox" checked={includeT} onChange={e=>setIncludeT(e.target.checked)} /> Include T header for multiple tests</label>
        </div>
        <div style={{marginTop:8}}>
          <label><input type="radio" name="single" checked={singleFile} onChange={()=>setSingleFile(true)} /> Single combined file</label>
          <div><label><input type="radio" name="single" checked={!singleFile} onChange={()=>setSingleFile(false)} /> One testcase per block</label></div>
        </div>
        <div style={{marginTop:12}}>
          <button onClick={doExport} style={{marginRight:8}}>Export</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
