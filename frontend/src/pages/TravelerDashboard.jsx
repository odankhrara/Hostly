import React, { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { searchProperties, setSearchFilters } from '../store/slices/propertiesSlice'
import { fetchFavorites, fetchBookings, addFavorite, removeFavorite } from '../store/slices/bookingsSlice'
import { 
  selectProperties, 
  selectPropertiesSearching, 
  selectPropertiesError,
  selectSearchFilters,
  selectFavorites,
  selectBookings,
  selectBookingsLoading
} from '../store/selectors'
import PropertyCard from '../components/PropertyCard'
import BookingStatusBadge from '../components/BookingStatusBadge'
import AISearchAssistant from '../components/AISearchAssistant'

export default function TravelerDashboard() {
  const dispatch = useAppDispatch()
  const properties = useAppSelector(selectProperties)
  const searching = useAppSelector(selectPropertiesSearching)
  const propertiesError = useAppSelector(selectPropertiesError)
  const filters = useAppSelector(selectSearchFilters)
  const favorites = useAppSelector(selectFavorites)
  const bookings = useAppSelector(selectBookings)
  const bookingsLoading = useAppSelector(selectBookingsLoading)
  
  const [tab, setTab] = useState('search')
  const [showAISearch, setShowAISearch] = useState(false)
  const [error, setError] = useState('')

  const validateDates = () => {
    if (!filters.startDate || !filters.endDate) return true
    
    const start = new Date(filters.startDate)
    const end = new Date(filters.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    
    if (start < today) {
      setError('Check-in date cannot be in the past.')
      return false
    }
    
    if (end <= start) {
      setError('Check-out date must be after check-in date.')
      return false
    }
    
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    if (daysDiff > 365) {
      setError('Stay duration cannot exceed 365 days.')
      return false
    }
    
    return true
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    
    if (searching) return
    
    setError('')
    
    if (e && !validateDates()) {
      return
    }
    
    dispatch(searchProperties(filters))
  }

  useEffect(() => {
    dispatch(fetchFavorites())
    dispatch(fetchBookings())
    // Load properties by default when component mounts
    dispatch(searchProperties(filters))
  }, [dispatch])

  // Load properties when search tab becomes active (if list is empty)
  useEffect(() => {
    if (tab === 'search' && properties.length === 0) {
      dispatch(searchProperties(filters))
    }
  }, [tab, dispatch])

  const toggleFav = async (p) => {
    try {
      const isFav = favorites.some(f => f.id === p.id)
      
      if (isFav) {
        await dispatch(removeFavorite(p.id))
      } else {
        await dispatch(addFavorite(p.id))
      }
      
      // Refresh favorites list
      dispatch(fetchFavorites())
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setTab('search')} className={`px-4 py-2 rounded-xl ${tab === 'search' ? 'bg-brand-600 text-white' : 'bg-white border'}`}>
          Search
        </button>
        <button onClick={() => setTab('favorites')} className={`px-4 py-2 rounded-xl ${tab === 'favorites' ? 'bg-brand-600 text-white' : 'bg-white border'}`}>
          Favourites
        </button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-xl ${tab === 'history' ? 'bg-brand-600 text-white' : 'bg-white border'}`}>
          History
        </button>
        <button 
          onClick={() => setShowAISearch(!showAISearch)} 
          className={`px-4 py-2 rounded-xl flex items-center gap-2 ${showAISearch ? 'bg-purple-600 text-white' : 'bg-white border'}`}
        >
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </button>
      </div>

      {/* AI Search Assistant */}
      {showAISearch && (
        <AISearchAssistant />
      )}

      {tab === 'search' && !showAISearch && (
        <div>
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow p-4 grid md:grid-cols-5 gap-3">
            <input 
              placeholder="Location" 
              value={filters.location || ''} 
              onChange={(e) => dispatch(setSearchFilters({ location: e.target.value }))} 
              className="rounded-xl border px-3 py-2 md:col-span-2" 
              aria-label="Location" 
            />
            <input 
              type="date" 
              value={filters.startDate || ''} 
              onChange={(e) => dispatch(setSearchFilters({ startDate: e.target.value }))} 
              className="rounded-xl border px-3 py-2" 
              aria-label="Start date" 
            />
            <input 
              type="date" 
              value={filters.endDate || ''} 
              onChange={(e) => dispatch(setSearchFilters({ endDate: e.target.value }))} 
              className="rounded-xl border px-3 py-2" 
              aria-label="End date" 
            />
            <input 
              type="number" 
              min="1" 
              value={filters.guests || 1} 
              onChange={(e) => dispatch(setSearchFilters({ guests: Number(e.target.value) }))} 
              className="rounded-xl border px-3 py-2" 
              aria-label="Guests" 
            />
            <button className="rounded-xl bg-brand-600 text-white px-4 py-2">Search</button>
          </form>
          
          {(error || propertiesError) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <strong>Error:</strong> {error || propertiesError}
            </div>
          )}
        </div>
      )}

      {tab === 'search' && (
        <div>
          {properties.length === 0 && !searching ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <p className="text-gray-600 text-lg mb-2">No properties found</p>
              <p className="text-gray-500 text-sm">
                {filters.location || filters.startDate || filters.endDate 
                  ? 'Try adjusting your search filters or clearing them to see all available properties.'
                  : 'No properties are available yet. Properties will appear here once owners create listings.'}
              </p>
            </div>
          ) : searching ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <p className="text-gray-600">Searching properties...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(p => (
                <PropertyCard 
                  key={p.id} 
                  p={p} 
                  onFavToggle={toggleFav} 
                  isFav={favorites.some(f => f.id === p.id)} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(p => (
            <PropertyCard 
              key={p.id} 
              p={p} 
              onFavToggle={toggleFav} 
              isFav={true} 
            />
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Property</th>
                <th className="p-2">Dates</th>
                <th className="p-2">Guests</th>
                <th className="p-2">Price</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingsLoading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">No bookings yet</td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id} className="border-t">
                    <td className="p-2">{b.propertyName}</td>
                    <td className="p-2">{b.startDate} → {b.endDate}</td>
                    <td className="p-2">{b.guests}</td>
                    <td className="p-2 font-semibold text-brand-700">
                      ${b.total_price ? b.total_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="p-2">
                      <BookingStatusBadge status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
