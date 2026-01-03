import React, { useState } from 'react'

export default function ManualAdd({ onAdd }){
  const [name, setName] = useState('Manual Case')
  const [content, setContent] = useState('')

  function submit(){
    if(!content) return alert('Content required')
    onAdd(name, content)
    setContent('')
  }

  return (
    <div>
      <div>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:6,marginTop:4}} />
      </div>
      <div style={{marginTop:8}}>
        <label>Content</label>
        <textarea value={content} onChange={e=>setContent(e.target.value)} style={{width:'100%',minHeight:120,marginTop:4}} />
      </div>
      <div style={{marginTop:8}}>
        <button onClick={submit}>Add Testcase</button>
      </div>
    </div>
  )
}
