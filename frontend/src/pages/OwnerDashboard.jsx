import React, { useEffect, useState } from 'react'
import api from '../services/api'
import BookingStatusBadge from '../components/BookingStatusBadge'
import { Link } from 'react-router-dom'

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState([])
  const [properties, setProperties] = useState([])

  const load = async () => {
    try {
      const [bRes, pRes] = await Promise.all([
        api.get('/owner/bookings'),
        api.get('/owner/properties')
      ])
      setBookings(bRes.data.bookings || [])
      setProperties(pRes.data.properties || [])
    } catch {}
  }

  useEffect(()=>{ load() }, [])

  const respond = async (id, action) => {
    try {
      const url = action==='ACCEPT' ? `/bookings/${id}/accept` : `/bookings/${id}/cancel`
      await api.post(url)
      load()
    } catch {}
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Properties</h2>
        <Link to="/add-property" className="px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700">Add property</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map(p=>(
          <article key={p.id} className="bg-white rounded-2xl border p-4">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.location}</p>
            <p className="mt-1">${p.pricing}/night</p>
          </article>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-3">Booking Requests</h2>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left"><th className="p-2">Property</th><th className="p-2">Guest</th><th className="p-2">Dates</th><th className="p-2">Guests</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {bookings.map(b=>(
              <tr key={b.id} className="border-t">
                <td className="p-2">{b.propertyName}</td>
                <td className="p-2">{b.travelerName}</td>
                <td className="p-2">{b.startDate} → {b.endDate}</td>
                <td className="p-2">{b.guests}</td>
                <td className="p-2"><BookingStatusBadge status={b.status} /></td>
                <td className="p-2 space-x-2">
                  <button onClick={()=>respond(b.id,'ACCEPT')} className="px-3 py-1 rounded-lg bg-green-600 text-white disabled:opacity-60" disabled={b.status!=='PENDING'}>Accept</button>
                  <button onClick={()=>respond(b.id,'CANCEL')} className="px-3 py-1 rounded-lg bg-red-600 text-white disabled:opacity-60" disabled={b.status==='CANCELLED'}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
