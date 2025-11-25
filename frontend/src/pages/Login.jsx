import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser } from '../store/slices/authSlice'
import { selectUser, selectAuthError, selectAuthLoading } from '../store/selectors'

export default function Login() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const error = useAppSelector(selectAuthError)
  const loading = useAppSelector(selectAuthLoading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [params] = useSearchParams()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const next = params.get('next')
      navigate(next || (user.role === 'owner' ? '/owner' : '/traveler'), { replace: true })
    }
  }, [user, navigate, params])

  const onSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) {
      const next = params.get('next')
      navigate(next || (result.payload.role === 'owner' ? '/owner' : '/traveler'), { replace: true })
    }
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
