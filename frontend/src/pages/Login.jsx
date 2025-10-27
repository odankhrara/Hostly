import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await login(email, password) // POST /auth/login
      const next = params.get('next')
      navigate(next || (user.role === 'owner' ? '/owner' : '/traveler'), { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-semibold">Login</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm">Email</span>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
                 required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
                 required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-brand-600 text-white px-4 py-2">
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}
