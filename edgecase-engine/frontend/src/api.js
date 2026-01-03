import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export const createGuest = ()=> axios.post(`${API_BASE}/guest`).then(r=>r.data)
export const createProblem = (payload)=> axios.post(`${API_BASE}/problems`, payload).then(r=>r.data)
export const listProblems = (owner_id)=> {
	const config = owner_id ? { params: { owner_id } } : {}
	return axios.get(`${API_BASE}/problems`, config).then(r=>r.data)
}
export const generate = (problemId, opts)=> axios.post(`${API_BASE}/problems/${problemId}/generate`, opts).then(r=>r.data)
export const saveBulk = (problemId, testcases)=> axios.post(`${API_BASE}/problems/${problemId}/testcases/bulk`, { testcases }).then(r=>r.data)
export const getProblem = (id)=> axios.get(`${API_BASE}/problems/${id}`).then(r=>r.data)
export const listTestcases = (problemId, params)=> axios.get(`${API_BASE}/problems/${problemId}/testcases`, { params }).then(r=>r.data)
export const updateTestcase = (id, payload)=> axios.put(`${API_BASE}/testcases/${id}`, payload).then(r=>r.data)
export const deleteTestcase = (id)=> axios.delete(`${API_BASE}/testcases/${id}`).then(r=>r.data)
export const exportProblem = (id, params)=> axios.get(`${API_BASE}/problems/${id}/export`, { params, responseType: 'blob' }).then(r=>r.data)
export const seedSamples = ()=> axios.post(`${API_BASE}/seed`).then(r=>r.data)
export const createTestcase = (problemId, payload)=> axios.post(`${API_BASE}/problems/${problemId}/testcases`, payload).then(r=>r.data)
