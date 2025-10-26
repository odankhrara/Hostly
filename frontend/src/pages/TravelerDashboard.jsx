import React, { useEffect, useState } from 'react'
import api from '../services/api'
import PropertyCard from '../components/PropertyCard'
import BookingStatusBadge from '../components/BookingStatusBadge'

export default function TravelerDashboard() {
  const [filters, setFilters] = useState({ location: '', startDate: '', endDate: '', guests: 1 })
  const [list, setList] = useState([])
  const [favorites, setFavorites] = useState([])
  const [tab, setTab] = useState('search')
  const [bookings, setBookings] = useState([])

  const search = async (e) => {
    if (e) e.preventDefault()
    const { data } = await api.get('/properties/search', { params: filters })
    setList(data.properties || [])
  }

  const loadFavs = async () => {
    try { const { data } = await api.get('/traveler/favorites'); setFavorites(data.favorites || []) } catch {}
  }

  const loadBookings = async () => {
    try { const { data } = await api.get('/bookings/me'); setBookings(data.bookings || []) } catch {}
  }

  useEffect(()=>{ loadFavs(); loadBookings(); }, [])

  const toggleFav = async (p) => {
    try {
      const isFav = favorites.some(f=> f.id === p.id)
      if (isFav) await api.delete(`/traveler/favorites/${p.id}`)
      else await api.post(`/traveler/favorites/${p.id}`)
      loadFavs()
    } catch {}
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={()=>setTab('search')} className={`px-4 py-2 rounded-xl ${tab==='search'?'bg-brand-600 text-white':'bg-white border'}`}>Search</button>
        <button onClick={()=>setTab('favorites')} className={`px-4 py-2 rounded-xl ${tab==='favorites'?'bg-brand-600 text-white':'bg-white border'}`}>Favourites</button>
        <button onClick={()=>setTab('history')} className={`px-4 py-2 rounded-xl ${tab==='history'?'bg-brand-600 text-white':'bg-white border'}`}>History</button>
      </div>

      {tab==='search' && (
        <form onSubmit={search} className="bg-white rounded-2xl shadow p-4 grid md:grid-cols-5 gap-3">
          <input placeholder="Location" value={filters.location} onChange={(e)=>setFilters({...filters, location: e.target.value})} className="rounded-xl border px-3 py-2 md:col-span-2" aria-label="Location" />
          <input type="date" value={filters.startDate} onChange={(e)=>setFilters({...filters, startDate: e.target.value})} className="rounded-xl border px-3 py-2" aria-label="Start date" />
          <input type="date" value={filters.endDate} onChange={(e)=>setFilters({...filters, endDate: e.target.value})} className="rounded-xl border px-3 py-2" aria-label="End date" />
          <input type="number" min="1" value={filters.guests} onChange={(e)=>setFilters({...filters, guests: Number(e.target.value)})} className="rounded-xl border px-3 py-2" aria-label="Guests" />
          <button className="rounded-xl bg-brand-600 text-white px-4 py-2">Search</button>
        </form>
      )}

      {tab==='search' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(p => <PropertyCard key={p.id} p={p} onFavToggle={toggleFav} isFav={favorites.some(f=>f.id===p.id)} />)}
        </div>
      )}

      {tab==='favorites' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(p => <PropertyCard key={p.id} p={p} onFavToggle={toggleFav} isFav={true} />)}
        </div>
      )}

      {tab==='history' && (
        <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left"><th className="p-2">Property</th><th className="p-2">Dates</th><th className="p-2">Guests</th><th className="p-2">Status</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.propertyName}</td>
                  <td className="p-2">{b.startDate} → {b.endDate}</td>
                  <td className="p-2">{b.guests}</td>
                  <td className="p-2"><BookingStatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
