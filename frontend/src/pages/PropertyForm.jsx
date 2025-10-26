import React, { useState } from 'react'
import api from '../services/api'

export default function PropertyForm() {
  const [form, setForm] = useState({
    name:'', type:'Apartment', location:'', description:'', pricing:100, amenities: '', bedrooms:1, bathrooms:1, availabilityFrom:'', availabilityTo:''
  })
  const [message, setMessage] = useState('')

  const set = (k,v)=> setForm(prev=>({...prev,[k]:v}))

  const submit = async (e)=>{
    e.preventDefault()
    const payload = { ...form, amenities: form.amenities.split(',').map(a=>a.trim()).filter(Boolean) }
    const { data } = await api.post('/owner/properties', payload)
    setMessage('Property posted: ' + data.property.name)
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-semibold">Post a property</h2>
      <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Name</span>
          <input value={form.name} onChange={(e)=>set('name',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" required />
        </label>
        <label className="block">
          <span className="text-sm">Type</span>
          <select value={form.type} onChange={(e)=>set('type',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2">
            <option>Apartment</option><option>House</option><option>Villa</option><option>Cabin</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm">Location</span>
          <input value={form.location} onChange={(e)=>set('location',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" required />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm">Description</span>
          <textarea value={form.description} onChange={(e)=>set('description',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" rows="4" />
        </label>
        <label className="block">
          <span className="text-sm">Pricing (per night)</span>
          <input type="number" min="1" value={form.pricing} onChange={(e)=>set('pricing',Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Amenities (comma separated)</span>
          <input value={form.amenities} onChange={(e)=>set('amenities',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Bedrooms</span>
          <input type="number" min="0" value={form.bedrooms} onChange={(e)=>set('bedrooms',Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Bathrooms</span>
          <input type="number" min="0" value={form.bathrooms} onChange={(e)=>set('bathrooms',Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Availability From</span>
          <input type="date" value={form.availabilityFrom} onChange={(e)=>set('availabilityFrom',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Availability To</span>
          <input type="date" value={form.availabilityTo} onChange={(e)=>set('availabilityTo',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <div className="md:col-span-2">
          <button className="px-5 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700">Post property</button>
          {message && <span className="ml-3 text-sm text-green-700">{message}</span>}
        </div>
      </form>
    </div>
  )
}
