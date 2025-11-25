import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { COUNTRIES } from '../utils/countries'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectUser } from '../store/selectors'
import { setUser } from '../store/slices/authSlice'
import { User, Camera, CheckCircle } from 'lucide-react'

export default function Profile() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const updateUser = (userData) => {
    dispatch(setUser(userData))
  }
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
  const [messageType, setMessageType] = useState('success')

  // Update form when user changes (only on initial load or when user ID changes)
  useEffect(() => {
    if (user && (!form.name || form.name !== user.name)) {
      setForm({
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
    }
  }, [user?.id]) // Only update when user ID changes (new user login)

  const set = (k,v)=> setForm(prev=>({...prev,[k]:v}))

  const save = async (e) => {
    e.preventDefault()
    try {
      // Remove internal fields before sending
      const { _lastImageUrl, ...formData } = form
      const { data } = await api.put('/traveler/profile', formData)
      updateUser(data.user)
      setMessage('Profile updated successfully')
      setMessageType('success')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile'
      setMessage(errorMessage)
      setMessageType('error')
      console.error('Profile update error:', error)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const onPic = async (e) => {
    const file = e.target.files?.[0]
    if(!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file')
      setMessageType('error')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB')
      setMessageType('error')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const { data } = await api.post('/traveler/profile/avatar', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      })
      console.log('Profile picture upload response:', data)
      // Update user state with new profile image
      updateUser(data.user)
      // Force form to update with new user data
      setForm(prev => ({
        ...prev,
        // Keep form data but user state is updated
      }))
      setMessage('Profile picture uploaded successfully')
      setMessageType('success')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Profile picture upload error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload profile picture'
      setMessage(errorMessage)
      setMessageType('error')
      setTimeout(() => setMessage(''), 5000)
    } finally { 
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (user?.profile_image_url) {
      // If it's already a full URL, return it
      if (user.profile_image_url.startsWith('http')) {
        return user.profile_image_url
      }
      // Otherwise, construct the full URL using the API base URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      // Remove /api from the end if present to get the base URL
      const baseUrl = apiBaseUrl.endsWith('/api') 
        ? apiBaseUrl.replace('/api', '') 
        : apiBaseUrl.replace(/\/api$/, '') || 'http://localhost:3000'
      
      // Ensure the image path starts with /
      const imagePath = user.profile_image_url.startsWith('/') 
        ? user.profile_image_url 
        : `/${user.profile_image_url}`
      
      // Construct full URL with cache-busting
      const separator = imagePath.includes('?') ? '&' : '?'
      const fullUrl = `${baseUrl}${imagePath}${separator}t=${Date.now()}`
      console.log('Profile image URL:', fullUrl, 'from:', user.profile_image_url)
      return fullUrl
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-brand-600" />
        <h2 className="text-3xl font-bold text-gray-900">Your Profile</h2>
      </div>

      {/* Profile Picture Section */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Profile Image Display */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-brand-100 shadow-lg relative">
              {getProfileImageUrl() ? (
                <img 
                  key={`${user?.id}-${user?.profile_image_url}`} // Force re-render when image changes
                  src={getProfileImageUrl()} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', {
                      src: e.target.src,
                      profile_image_url: user?.profile_image_url,
                      constructedUrl: getProfileImageUrl(),
                      userId: user?.id
                    })
                    e.target.style.display = 'none'
                    const fallback = e.target.nextElementSibling
                    if (fallback) {
                      fallback.style.display = 'flex'
                    }
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', {
                      src: getProfileImageUrl(),
                      profile_image_url: user?.profile_image_url
                    })
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full absolute inset-0 ${getProfileImageUrl() ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-brand-100 to-blue-100`}
              >
                <User className="w-16 h-16 text-brand-400" />
              </div>
            </div>
            {/* Upload Button Overlay */}
            <label className="absolute bottom-0 right-0 p-3 bg-brand-600 text-white rounded-full cursor-pointer hover:bg-brand-700 transition-colors shadow-lg">
              <Camera className="w-5 h-5" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={onPic} 
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Upload Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Picture</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a profile picture to personalize your account. JPG, PNG or GIF. Max size 5MB.
            </p>
            {uploading && (
              <div className="flex items-center gap-2 text-brand-600">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={save} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Name</span>
            <input 
              value={form.name} 
              onChange={(e)=>set('name',e.target.value)} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" 
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Email</span>
            <input 
              type="email" 
              value={form.email} 
              onChange={(e)=>set('email',e.target.value)} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" 
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Phone</span>
            <input 
              value={form.phone} 
              onChange={(e)=>set('phone',e.target.value)} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" 
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">About me</span>
            <input 
              value={form.about} 
              onChange={(e)=>set('about',e.target.value)} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" 
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">City</span>
            <input 
              value={form.city} 
              onChange={(e)=>set('city',e.target.value)} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" 
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">State (abbrev)</span>
            <input 
              placeholder="CA, NY, TX..." 
              value={form.state} 
              onChange={(e)=>set('state',e.target.value.toUpperCase())} 
              maxLength="2"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 uppercase focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" 
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Country</span>
            <select 
              value={form.country} 
              onChange={(e)=>set('country',e.target.value)} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            >
              {COUNTRIES.map(c=> <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Languages</span>
            <input 
              placeholder="English, Spanish, French..." 
              value={form.languages} 
              onChange={(e)=>set('languages',e.target.value)} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" 
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Gender</span>
            <select 
              value={form.gender} 
              onChange={(e)=>set('gender',e.target.value)} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button 
            type="submit"
            className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
          >
            Save Changes
          </button>
          {message && (
            <div className={`flex items-center gap-2 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : null}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
