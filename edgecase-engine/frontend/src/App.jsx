import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import Background from './components/Background'

export default function App(){
  return (
    <div className="app-container">
      <Background />
      <header className="app-header">
        <h1>EdgeCase Engine</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/create">Create</Link>
          <Link to="/library">Library</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
