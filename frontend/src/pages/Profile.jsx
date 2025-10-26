import React, { useState } from 'react'
import api from '../services/api'
import { COUNTRIES } from '../utils/countries'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    about: user?.about || '',
    city: user?.city || '',
    country: user?.country || 'US',
    state: user?.state || '',
    languages: user?.languages || '',
    gender: user?.gender || ''
  })
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const set = (k,v)=> setForm(prev=>({...prev,[k]:v}))

  const save = async (e) => {
    e.preventDefault()
    const { data } = await api.put('/traveler/profile', form)
    setUser(data.user); setMessage('Profile updated')
  }

  const onPic = async (e) => {
    const file = e.target.files?.[0]; if(!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('avatar', file)
      const { data } = await api.post('/traveler/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUser(data.user); setMessage('Profile picture uploaded')
    } finally { setUploading(false) }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-semibold">Your Profile</h2>
      <form onSubmit={save} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Name</span>
          <input value={form.name} onChange={(e)=>set('name',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Email</span>
          <input type="email" value={form.email} onChange={(e)=>set('email',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Phone</span>
          <input value={form.phone} onChange={(e)=>set('phone',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">About me</span>
          <input value={form.about} onChange={(e)=>set('about',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">City</span>
          <input value={form.city} onChange={(e)=>set('city',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Country</span>
          <select value={form.country} onChange={(e)=>set('country',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2">
            {COUNTRIES.map(c=> <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm">State (abbrev)</span>
          <input placeholder="CA, NY, TX..." value={form.state} onChange={(e)=>set('state',e.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border px-3 py-2 uppercase" />
        </label>
        <label className="block">
          <span className="text-sm">Languages</span>
          <input value={form.languages} onChange={(e)=>set('languages',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Gender</span>
          <input value={form.gender} onChange={(e)=>set('gender',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <div>
          <span className="text-sm">Profile Picture</span>
          <input type="file" accept="image/*" onChange={onPic} className="mt-1 block" />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        </div>
        <div className="md:col-span-2">
          <button className="px-5 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700">Save changes</button>
          {message && <span className="ml-3 text-sm text-green-700">{message}</span>}
        </div>
      </form>
    </div>
  )
}
