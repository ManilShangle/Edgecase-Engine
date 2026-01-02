import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function App(){
  return (
    <div style={{fontFamily:'Arial, sans-serif', padding:20}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>EdgeCase Engine</h1>
        <nav>
          <Link to="/">Home</Link> | <Link to="/create">Create Problem</Link> | <Link to="/library">Library</Link>
        </nav>
      </header>
      <main style={{marginTop:20}}>
        <Outlet />
      </main>
    </div>
  )
}
