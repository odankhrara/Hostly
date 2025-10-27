import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-semibold">Page not found</h2>
      <p className="mt-2 text-gray-600">The page you are looking for doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white">Go Home</Link>
    </div>
  )
}
