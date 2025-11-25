import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { getCurrentUser, logoutUser } from './store/slices/authSlice'
import { selectUser, selectAuthLoading } from './store/selectors'
import NavBar from './components/NavBar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TravelerDashboard from './pages/TravelerDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import PropertyDetails from './pages/PropertyDetails'
import PropertyForm from './pages/PropertyForm'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import AgentButton from './components/AgentButton'

function ProtectedRoute({ children, roles }) {
  const user = useAppSelector(selectUser)
  const loading = useAppSelector(selectAuthLoading)
  const dispatch = useAppDispatch()
  const location = useLocation()

  useEffect(() => {
    // Handle global 401 errors
    const onUnauth = () => {
      dispatch(logoutUser())
      const here = location.pathname + location.search
      window.location.href = `/login?next=${encodeURIComponent(here)}`
    }
    window.addEventListener('hostly:unauth', onUnauth)
    return () => window.removeEventListener('hostly:unauth', onUnauth)
  }, [dispatch, location])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppContent() {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectAuthLoading)

  // Initialize auth on mount
  useEffect(() => {
    dispatch(getCurrentUser())
  }, [dispatch])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/traveler" element={
            <ProtectedRoute roles={['traveler']}>
              <TravelerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner" element={
            <ProtectedRoute roles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/add-property" element={
            <ProtectedRoute roles={['owner']}>
              <PropertyForm />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute roles={['traveler','owner']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Hostly
      </footer>
      <AgentButton />
    </div>
  )
}

export default AppContent
