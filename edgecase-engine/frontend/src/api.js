import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export const createGuest = ()=> axios.post(`${API_BASE}/guest`).then(r=>r.data)
export const createProblem = (payload)=> axios.post(`${API_BASE}/problems`, payload).then(r=>r.data)
export const listProblems = (owner_id)=> axios.get(`${API_BASE}/problems`, { params: { owner_id }}).then(r=>r.data)
export const generate = (problemId, opts)=> axios.post(`${API_BASE}/problems/${problemId}/generate`, opts).then(r=>r.data)
export const saveBulk = (problemId, testcases)=> axios.post(`${API_BASE}/problems/${problemId}/testcases/bulk`, { testcases }).then(r=>r.data)
