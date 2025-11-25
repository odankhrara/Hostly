import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerUser } from '../store/slices/authSlice'
import { selectUser, selectAuthError, selectAuthLoading } from '../store/selectors'

export default function Signup() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const error = useAppSelector(selectAuthError)
  const loading = useAppSelector(selectAuthLoading)
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'traveler' })
  const navigate = useNavigate()
  const set = (k,v)=> setForm(prev=>({...prev,[k]:v}))

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'owner' ? '/owner' : '/traveler', { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) {
      navigate(result.payload.role === 'owner' ? '/owner' : '/traveler', { replace: true })
    }
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
        <button disabled={loading} type="submit" className="w-full rounded-xl bg-brand-600 text-white px-4 py-2">
          {loading ? 'Creating…' : 'Sign up'}
        </button>
      </form>
    </div>
  )
}
