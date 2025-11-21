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

  // Calculate total price based on dates, price per night, and tax
  const calculateTotalPrice = () => {
    if (!booking.startDate || !booking.endDate || !p?.price_per_night) {
      return null
    }
    
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    
    if (end <= start) {
      return null
    }
    
    // Calculate number of nights
    const timeDiff = end.getTime() - start.getTime()
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    
    if (nights <= 0) {
      return null
    }
    
    // Calculate subtotal (nights × price per night)
    const subtotal = nights * p.price_per_night
    
    // Calculate tax (if tax_rate exists)
    const taxRate = p.tax_rate || 0
    const taxAmount = (subtotal * taxRate) / 100
    
    // Calculate total (subtotal + tax)
    const total = subtotal + taxAmount
    
    return { nights, subtotal, taxRate, taxAmount, total }
  }

  const book = async (e) => {
    e.preventDefault()
    
    // Frontend validation
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0) // Normalize start date to start of day
    
    // Allow today and future dates
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
        <div className="mt-4 border-t pt-4">
          <p className="text-2xl font-bold">
            ${p.price_per_night}
            <span className="text-sm text-gray-600 font-normal"> / night</span>
          </p>
          
          {/* Total Price Display */}
          {(() => {
            const priceInfo = calculateTotalPrice()
            if (priceInfo) {
              return (
                <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        ${p.price_per_night} × {priceInfo.nights} {priceInfo.nights === 1 ? 'night' : 'nights'}
                      </span>
                      <span className="text-gray-900 font-medium">
                        ${priceInfo.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {priceInfo.taxRate > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Tax ({priceInfo.taxRate}%)
                        </span>
                        <span className="text-gray-700">
                          ${priceInfo.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-brand-200">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-brand-700">
                      ${priceInfo.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )
            }
            return null
          })()}
        </div>
        
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
