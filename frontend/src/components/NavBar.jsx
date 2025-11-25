import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../store/slices/authSlice'
import { selectUser } from '../store/selectors'
import { LogOut, User, Home, LayoutDashboard } from 'lucide-react'

export default function NavBar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login', { replace: true })
  }

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (user?.profile_image_url) {
      // If it's already a full URL, return it
      if (user.profile_image_url.startsWith('http')) {
        return user.profile_image_url
      }
      // Otherwise, construct the full URL using the API base URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      // Remove /api from the end if present to get the base URL
      const baseUrl = apiBaseUrl.endsWith('/api') 
        ? apiBaseUrl.replace('/api', '') 
        : apiBaseUrl.replace(/\/api$/, '') || 'http://localhost:3000'
      
      // Ensure the image path starts with /
      const imagePath = user.profile_image_url.startsWith('/') 
        ? user.profile_image_url 
        : `/${user.profile_image_url}`
      
      return `${baseUrl}${imagePath}`
    }
    return null
  }

  return (
    <header className="border-b bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" aria-label="Hostly home">
            <Home className="w-6 h-6 text-brand-600" aria-hidden="true" />
            <span className="font-semibold text-lg">Hostly</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg ${
                  isActive ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Home
            </NavLink>

            {user?.role === 'traveler' && (
              <NavLink
                to="/traveler"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg ${
                    isActive ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}

            {user?.role === 'owner' && (
              <NavLink
                to="/owner"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg ${
                    isActive ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <span className="inline-flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" /> Owner
                </span>
              </NavLink>
            )}

            {user ? (
              <>
                {/* Profile Picture */}
                <Link
                  to="/profile"
                  className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-brand-200 hover:border-brand-400 transition-colors flex-shrink-0"
                  title={user.name || 'Profile'}
                >
                  {getProfileImageUrl() ? (
                    <img 
                      src={getProfileImageUrl()} 
                      alt={user.name || 'Profile'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const fallback = e.target.nextElementSibling
                        if (fallback) {
                          fallback.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-full ${getProfileImageUrl() ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-brand-100 to-blue-100`}
                  >
                    <User className="w-5 h-5 text-brand-600" />
                  </div>
                </Link>
                
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg inline-flex items-center gap-1 ${
                      isActive ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <span className="hidden sm:inline">Profile</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl border font-medium ${
                      isActive
                        ? 'border-brand-600 text-brand-700'
                        : 'border-gray-300 text-gray-700 hover:border-brand-500 hover:text-brand-700'
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700"
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
