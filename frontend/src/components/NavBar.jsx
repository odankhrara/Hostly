import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Home, LayoutDashboard } from 'lucide-react'

export default function NavBar() {
  const { user, logout } = useAuth()

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
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg inline-flex items-center gap-1 ${
                      isActive ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <User className="w-4 h-4" /> Profile
                </NavLink>
                <button
                  onClick={logout}
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
