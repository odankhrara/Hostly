import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <section className="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
          Welcome to <span className="text-brand-700">Hostly</span>
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          A modern Airbnb-like experience for Travelers and Owners.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/traveler" className="px-5 py-3 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 focus-ring">Traveler Dashboard</Link>
          <Link to="/owner" className="px-5 py-3 rounded-2xl border border-brand-600 text-brand-700 hover:bg-brand-50 focus-ring">Owner Dashboard</Link>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow p-6">
        <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop" alt="Hostly sample property" className="rounded-2xl w-full h-72 object-cover" />
      </div>
    </section>
  )
}
