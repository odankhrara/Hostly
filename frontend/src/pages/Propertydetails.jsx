import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function PropertyDetails() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [booking, setBooking] = useState({ startDate:'', endDate:'', guests:1 })
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    const load = async ()=>{
      const { data } = await api.get(`/properties/${id}`)
      setP(data.property)
    }
    load()
  }, [id])

  const book = async (e) => {
    e.preventDefault()
    const { data } = await api.post(`/bookings`, { propertyId: id, ...booking })
    setMsg('Booking requested. Status: ' + data.booking.status)
  }

  if (!p) return <p>Loading...</p>

  return (
    <section className="grid md:grid-cols-2 gap-6">
      <div>
        <img src={p.photos?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop'} alt={p.name} className="rounded-2xl w-full h-80 object-cover" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(p.photos || []).slice(1,4).map((ph, i) => <img key={i} src={ph} alt={`Photo ${i+2}`} className="rounded-xl h-24 w-full object-cover" />)}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold">{p.name}</h2>
        <p className="text-gray-600">{p.location} • {p.type}</p>
        <p className="mt-2">{p.bedrooms} bedrooms • {p.bathrooms} bathrooms</p>
        <p className="mt-2">{p.amenities?.join(' • ')}</p>
        <p className="mt-4 text-2xl font-bold">${p.pricing}<span className="text-sm text-gray-600"> / night</span></p>
        <form onSubmit={book} className="mt-4 grid grid-cols-2 gap-3">
          <input type="date" value={booking.startDate} onChange={(e)=>setBooking({...booking, startDate:e.target.value})} className="rounded-xl border px-3 py-2" required />
          <input type="date" value={booking.endDate} onChange={(e)=>setBooking({...booking, endDate:e.target.value})} className="rounded-xl border px-3 py-2" required />
          <input type="number" min="1" value={booking.guests} onChange={(e)=>setBooking({...booking, guests:Number(e.target.value)})} className="rounded-xl border px-3 py-2" required />
          <button className="rounded-xl bg-brand-600 text-white px-4 py-2 col-span-2">Request booking</button>
        </form>
        {msg && <p className="mt-3 text-green-700">{msg}</p>}
      </div>
    </section>
  )
}
