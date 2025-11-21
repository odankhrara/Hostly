import React, { useState } from 'react'
import { Sparkles, DollarSign, FileText } from 'lucide-react'
import api from '../services/api'

export default function PropertyForm() {
  const [form, setForm] = useState({
    name:'', type:'Apartment', location:'', description:'', pricing:100, amenities: '', bedrooms:1, bathrooms:1, maxGuests:2, availabilityFrom:'', availabilityTo:'', taxRate:0
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [message, setMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState(null)

  const set = (k,v)=> setForm(prev=>({...prev,[k]:v}))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const submit = async (e)=>{
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('type', form.type)
    formData.append('location', form.location)
    formData.append('description', form.description)
    formData.append('pricing', form.pricing)
    formData.append('amenities', form.amenities.split(',').map(a=>a.trim()).filter(Boolean).join(','))
    formData.append('bedrooms', form.bedrooms)
    formData.append('bathrooms', form.bathrooms)
    formData.append('maxGuests', form.maxGuests)
    formData.append('availabilityFrom', form.availabilityFrom)
    formData.append('availabilityTo', form.availabilityTo)
    formData.append('taxRate', form.taxRate || 0)
    
    if (selectedImage) {
      formData.append('mainImage', selectedImage)
    }

    try {
      const { data } = await api.post('/owner/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setMessage('Property posted: ' + data.property.name)
      // Reset form
      setForm({
        name:'', type:'Apartment', location:'', description:'', pricing:100, amenities: '', bedrooms:1, bathrooms:1, maxGuests:2, availabilityFrom:'', availabilityTo:'', taxRate:0
      })
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      setMessage('Failed to post property: ' + (error.response?.data?.message || error.message))
    }
  }

  const generateDescription = async () => {
    if (!form.name || !form.location || !form.type) {
      setMessage('Please fill in name, location, and type first')
      return
    }

    setAiLoading(true)
    try {
      const { data } = await api.post('/agent/generate-description', {
        propertyData: {
          name: form.name,
          location: form.location,
          propertyType: form.type,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          amenities: form.amenities.split(',').map(a=>a.trim()).filter(Boolean),
          pricePerNight: form.pricing
        }
      })
      
      setForm(prev => ({ ...prev, description: data.description }))
      setAiSuggestions(data)
      setMessage('AI-generated description added!')
    } catch (error) {
      setMessage('Failed to generate description: ' + (error.response?.data?.message || error.message))
    } finally {
      setAiLoading(false)
    }
  }

  const getPricingSuggestions = async () => {
    if (!form.location || !form.type) {
      setMessage('Please fill in location and type first')
      return
    }

    setAiLoading(true)
    try {
      const { data } = await api.post('/agent/pricing-suggestions', {
        propertyData: {
          location: form.location,
          propertyType: form.type,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          amenities: form.amenities.split(',').map(a=>a.trim()).filter(Boolean)
        },
        marketData: {
          season: 'year-round',
          demand: 'medium',
          competition: 'moderate'
        }
      })
      
      setAiSuggestions(data)
      setMessage(`AI suggests base price: $${data.basePrice}/night`)
    } catch (error) {
      setMessage('Failed to get pricing suggestions: ' + (error.response?.data?.message || error.message))
    } finally {
      setAiLoading(false)
    }
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
          <span className="text-sm">Property Image</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="mt-1 w-full rounded-xl border px-3 py-2" 
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-xl border"
              />
            </div>
          )}
        </label>
        <label className="block md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Description</span>
            <button
              type="button"
              onClick={generateDescription}
              disabled={aiLoading}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          <textarea value={form.description} onChange={(e)=>set('description',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" rows="4" />
        </label>
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-sm">Pricing (per night)</span>
            <button
              type="button"
              onClick={getPricingSuggestions}
              disabled={aiLoading}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              {aiLoading ? 'Analyzing...' : 'AI Pricing'}
            </button>
          </div>
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
          <span className="text-sm">Max Guests</span>
          <input type="number" min="1" value={form.maxGuests} onChange={(e)=>set('maxGuests',Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Tax Rate (%)</span>
          <input 
            type="number" 
            min="0" 
            max="100" 
            step="0.01"
            value={form.taxRate} 
            onChange={(e)=>set('taxRate',Number(e.target.value))} 
            className="mt-1 w-full rounded-xl border px-3 py-2" 
            placeholder="e.g., 10.5 for 10.5%"
          />
          <p className="text-xs text-gray-500 mt-1">Set tax rate based on your property's city/location</p>
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

        {/* AI Suggestions Display */}
        {aiSuggestions && (
          <div className="md:col-span-2 mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              AI Suggestions
            </h3>
            
            {aiSuggestions.highlights && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Key Highlights:</h4>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.highlights.map((highlight, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {aiSuggestions.basePrice && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Pricing Analysis:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="font-medium">Base Price</p>
                    <p className="text-lg font-bold text-green-600">${aiSuggestions.basePrice}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="font-medium">Weekend Rate</p>
                    <p className="text-lg font-bold text-blue-600">${Math.round(aiSuggestions.basePrice * (aiSuggestions.weekendMultiplier || 1.2))}</p>
                  </div>
                </div>
                {aiSuggestions.tips && (
                  <div className="mt-3">
                    <p className="font-medium text-sm text-gray-700 mb-2">Revenue Tips:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {aiSuggestions.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {aiSuggestions.keywords && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">SEO Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.keywords.map((keyword, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
