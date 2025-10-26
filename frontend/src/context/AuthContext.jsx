import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // initialize from session
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me')   // GET /api/auth/me
        setUser(data?.user || null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // handle global 401
  useEffect(() => {
    const onUnauth = () => {
      setUser(null)
      const here = location.pathname + location.search
      navigate(`/login?next=${encodeURIComponent(here)}`, { replace: true })
    }
    window.addEventListener('hostly:unauth', onUnauth)
    return () => window.removeEventListener('hostly:unauth', onUnauth)
  }, [location, navigate])

  const register = async ({ name, email, password, role }) => {
    const { data } = await api.post('/auth/register', { name, email, password, role }) // POST
    setUser(data.user)
    return data.user
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password }) // POST
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthCtx.Provider value={{ user, loading, register, login, logout, setUser }}>
      {!loading && children}
    </AuthCtx.Provider>
  )
}

export function useAuth() { return useContext(AuthCtx) }
