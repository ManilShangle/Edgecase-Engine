import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing(){
  const nav = useNavigate()
  return (
    <div>
      <h2>Generate contest-killing edge cases from constraints in seconds.</h2>
      <div style={{marginTop:20}}>
        <button onClick={()=>nav('/create')} style={{padding:'8px 16px', marginRight:8}}>Create a Problem</button>
        <button onClick={()=>nav('/library')} style={{padding:'8px 16px'}}>View Library</button>
      </div>
      <p style={{marginTop:12, color:'#666'}}>No code execution. Just smarter test inputs.</p>
    </div>
  )
}
