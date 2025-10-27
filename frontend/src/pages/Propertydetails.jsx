import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import api from '../services/api'
import { getImageUrl } from '../utils/imageUtils'

export default function PropertyDetails() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [booking, setBooking] = useState({ startDate:'', endDate:'', guests:1 })
  const [msg, setMsg] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(()=>{
    const load = async ()=>{
      const { data } = await api.get(`/properties/${id}`)
      setP(data.property)
      
      // Check if property is favorited
      try {
        const favResponse = await api.get(`/favorites/check/${id}`)
        setIsFavorited(favResponse.data.isFavorited)
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }
    load()
  }, [id])

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${id}`)
        setIsFavorited(false)
        setMsg('Property removed from favorites')
      } else {
        await api.post('/favorites', { propertyId: id })
        setIsFavorited(true)
        setMsg('Property added to favorites')
      }
    } catch (error) {
      setMsg('Error: ' + (error.response?.data?.message || error.message))
    }
  }

  const book = async (e) => {
    e.preventDefault()
    
    // Frontend validation
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (start < today) {
      setMsg('Error: Check-in date cannot be in the past')
      return
    }
    
    if (end <= start) {
      setMsg('Error: Check-out date must be after check-in date')
      return
    }
    
    if (booking.guests < 1) {
      setMsg('Error: Number of guests must be at least 1')
      return
    }
    
    if (booking.guests > p.max_guests) {
      setMsg(`Error: Maximum ${p.max_guests} guests allowed for this property`)
      return
    }
    
    try {
      const { data } = await api.post(`/bookings`, { propertyId: id, ...booking })
      setMsg('Booking requested. Status: ' + data.booking.status)
    } catch (error) {
      setMsg('Error: ' + (error.response?.data?.message || error.message))
    }
  }

  if (!p) return <p>Loading...</p>

  return (
    <section className="grid md:grid-cols-2 gap-6">
      <div>
        <img 
          src={getImageUrl(p.main_image)} 
          alt={p.name} 
          className="rounded-2xl w-full h-80 object-cover" 
        />
      </div>
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">{p.name}</h2>
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full ${
              isFavorited ? 'text-brand-700' : 'text-gray-500 hover:text-brand-700'
            }`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
        <p className="text-gray-600">{p.location} • {p.property_type}</p>
        <p className="mt-2">{p.bedrooms} bedrooms • {p.bathrooms} bathrooms</p>
        <p className="mt-2">
          {Array.isArray(p.amenities) 
            ? p.amenities.join(' • ') 
            : typeof p.amenities === 'string'
            ? p.amenities
            : 'No amenities listed'}
        </p>
        <p className="mt-4 text-2xl font-bold">
          ${p.price_per_night}
          <span className="text-sm text-gray-600"> / night</span>
        </p>
        <form onSubmit={book} className="mt-4 grid grid-cols-2 gap-3">
          <input 
            type="date" 
            value={booking.startDate} 
            onChange={(e)=>setBooking({...booking, startDate:e.target.value})} 
            className="rounded-xl border px-3 py-2" 
            required 
          />
          <input 
            type="date" 
            value={booking.endDate} 
            onChange={(e)=>setBooking({...booking, endDate:e.target.value})} 
            className="rounded-xl border px-3 py-2" 
            required 
          />
          <input 
            type="number" 
            min="1" 
            max={p.max_guests}
            value={booking.guests} 
            onChange={(e)=>setBooking({...booking, guests:Number(e.target.value)})} 
            className="rounded-xl border px-3 py-2" 
            placeholder={`Max ${p.max_guests} guests`}
            required 
          />
          <button className="rounded-xl bg-brand-600 text-white px-4 py-2 col-span-2">
            Request booking
          </button>
        </form>
        {msg && (
          <p className={`mt-3 ${msg.startsWith('Error:') ? 'text-red-700' : 'text-green-700'}`}>
            {msg}
          </p>
        )}
      </div>
    </section>
  )
}
