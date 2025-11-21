import React, { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import api from '../services/api'
import PropertyCard from '../components/PropertyCard'
import BookingStatusBadge from '../components/BookingStatusBadge'
import AISearchAssistant from '../components/AISearchAssistant'

export default function TravelerDashboard() {
  const [filters, setFilters] = useState({ location: '', startDate: '', endDate: '', guests: 1 })
  const [list, setList] = useState([])
  const [favorites, setFavorites] = useState([])
  const [tab, setTab] = useState('search')
  const [bookings, setBookings] = useState([])
  const [showAISearch, setShowAISearch] = useState(false)
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)

  const validateDates = () => {
    if (!filters.startDate || !filters.endDate) return true
    
    const start = new Date(filters.startDate)
    const end = new Date(filters.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0) // Normalize start date to start of day
    
    // Allow today and future dates (check-in can be today)
    if (start < today) {
      setError('Check-in date cannot be in the past.')
      return false
    }
    
    // Check if check-out is before check-in
    if (end <= start) {
      setError('Check-out date must be after check-in date.')
      return false
    }
    
    // Check if date range is too long
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    if (daysDiff > 365) {
      setError('Stay duration cannot exceed 365 days.')
      return false
    }
    
    return true
  }

  const search = async (e) => {
    if (e) e.preventDefault()
    
    // Prevent multiple simultaneous searches
    if (searching) return
    
    // Clear previous errors
    setError('')
    
    // Validate dates (skip validation on initial load)
    if (e && !validateDates()) {
      return
    }
    
    setSearching(true)
    try {
      const { data } = await api.get('/properties/search', { params: filters })
      setList(data.properties || [])
    } catch (error) {
      console.error('Search error:', error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Search failed. Please try again.')
      }
    } finally {
      setSearching(false)
    }
  }

  const loadFavs = async () => {
    try { 
      const { data } = await api.get('/favorites'); 
      setFavorites(data.favorites || []) 
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  const loadBookings = async () => {
    try { const { data } = await api.get('/bookings/me'); setBookings(data.bookings || []) } catch {}
  }

  useEffect(()=>{ 
    loadFavs(); 
    loadBookings(); 
    // Load properties by default when component mounts (without filters)
    search();
  }, [])

  // Load properties when search tab becomes active (if list is empty)
  useEffect(() => {
    if (tab === 'search' && list.length === 0) {
      search();
    }
  }, [tab])

  const toggleFav = async (p) => {
    try {
      const isFav = favorites.some(f=> f.id === p.id)
      
      if (isFav) {
        await api.delete(`/favorites/${p.id}`)
      } else {
        await api.post('/favorites', { propertyId: p.id })
      }
      
      loadFavs()
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={()=>setTab('search')} className={`px-4 py-2 rounded-xl ${tab==='search'?'bg-brand-600 text-white':'bg-white border'}`}>Search</button>
        <button onClick={()=>setTab('favorites')} className={`px-4 py-2 rounded-xl ${tab==='favorites'?'bg-brand-600 text-white':'bg-white border'}`}>Favourites</button>
        <button onClick={()=>setTab('history')} className={`px-4 py-2 rounded-xl ${tab==='history'?'bg-brand-600 text-white':'bg-white border'}`}>History</button>
        <button 
          onClick={()=>setShowAISearch(!showAISearch)} 
          className={`px-4 py-2 rounded-xl flex items-center gap-2 ${showAISearch?'bg-purple-600 text-white':'bg-white border'}`}
        >
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </button>
      </div>

      {/* AI Search Assistant */}
      {showAISearch && (
        <AISearchAssistant />
      )}

      {tab==='search' && !showAISearch && (
        <div>
          <form onSubmit={search} className="bg-white rounded-2xl shadow p-4 grid md:grid-cols-5 gap-3">
            <input placeholder="Location" value={filters.location} onChange={(e)=>setFilters({...filters, location: e.target.value})} className="rounded-xl border px-3 py-2 md:col-span-2" aria-label="Location" />
            <input type="date" value={filters.startDate} onChange={(e)=>setFilters({...filters, startDate: e.target.value})} className="rounded-xl border px-3 py-2" aria-label="Start date" />
            <input type="date" value={filters.endDate} onChange={(e)=>setFilters({...filters, endDate: e.target.value})} className="rounded-xl border px-3 py-2" aria-label="End date" />
            <input type="number" min="1" value={filters.guests} onChange={(e)=>setFilters({...filters, guests: Number(e.target.value)})} className="rounded-xl border px-3 py-2" aria-label="Guests" />
            <button className="rounded-xl bg-brand-600 text-white px-4 py-2">Search</button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
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
            <thead><tr className="text-left"><th className="p-2">Property</th><th className="p-2">Dates</th><th className="p-2">Guests</th><th className="p-2">Price</th><th className="p-2">Status</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.propertyName}</td>
                  <td className="p-2">{b.startDate} → {b.endDate}</td>
                  <td className="p-2">{b.guests}</td>
                  <td className="p-2 font-semibold text-brand-700">
                    ${b.total_price ? b.total_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </td>
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
