import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'traveler' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k,v)=> setForm(prev=>({...prev,[k]:v}))

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await register(form) // POST /auth/register
      navigate(user.role === 'owner' ? '/owner' : '/traveler', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-semibold">Create your Hostly account</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm">Name</span>
          <input value={form.name} onChange={(e)=>set('name',e.target.value)}
                 required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Email</span>
          <input type="email" value={form.email} onChange={(e)=>set('email',e.target.value)}
                 required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input type="password" value={form.password} onChange={(e)=>set('password',e.target.value)}
                 required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Role</span>
          <select value={form.role} onChange={(e)=>set('role',e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2">
            <option value="traveler">Traveler</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-brand-600 text-white px-4 py-2">
          {loading ? 'Creating…' : 'Sign up'}
        </button>
      </form>
    </div>
  )
}
