import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Landing from './pages/Landing'
import CreateProblem from './pages/CreateProblem'
import Library from './pages/Library'
import About from './pages/About'
import './styles.css'
import ProblemDetail from './pages/ProblemDetail'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Landing />} />
          <Route path="create" element={<CreateProblem />} />
          <Route path="problems/:id" element={<ProblemDetail />} />
          <Route path="library" element={<Library />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
