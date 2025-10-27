import React, { useState } from 'react'
import { Search, Sparkles, MapPin, Calendar, Users, DollarSign } from 'lucide-react'
import api from '../services/api'

export default function AISearchAssistant() {
  const [searchCriteria, setSearchCriteria] = useState({
    location: '',
    startDate: '',
    endDate: '',
    guests: 2,
    budget: 'medium'
  })
  const [preferences, setPreferences] = useState({
    interests: '',
    mobility: '',
    diet: ''
  })
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [showPreferences, setShowPreferences] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/agent/property-recommendations', {
        searchCriteria,
        userPreferences: preferences
      })
      setRecommendations(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSearchCriteria = (field, value) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }))
  }

  const updatePreferences = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-semibold">AI Search Assistant</h2>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Basic Search Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Where are you going?"
              value={searchCriteria.location}
              onChange={(e) => updateSearchCriteria('location', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={searchCriteria.startDate}
              onChange={(e) => updateSearchCriteria('startDate', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={searchCriteria.endDate}
              onChange={(e) => updateSearchCriteria('endDate', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              placeholder="Guests"
              value={searchCriteria.guests}
              onChange={(e) => updateSearchCriteria('guests', parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Budget Selection */}
        <div className="flex gap-2">
          {['low', 'medium', 'high'].map((budget) => (
            <button
              key={budget}
              type="button"
              onClick={() => updateSearchCriteria('budget', budget)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchCriteria.budget === budget
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-1" />
              {budget.charAt(0).toUpperCase() + budget.slice(1)}
            </button>
          ))}
        </div>

        {/* Advanced Preferences Toggle */}
        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <Sparkles className="w-4 h-4" />
          {showPreferences ? 'Hide' : 'Show'} AI Preferences
        </button>

        {/* Advanced Preferences */}
        {showPreferences && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <input
                type="text"
                placeholder="e.g., museums, parks, beaches"
                value={preferences.interests}
                onChange={(e) => updatePreferences('interests', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobility
              </label>
              <input
                type="text"
                placeholder="e.g., wheelchair accessible"
                value={preferences.mobility}
                onChange={(e) => updatePreferences('mobility', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Preferences
              </label>
              <input
                type="text"
                placeholder="e.g., vegan, gluten-free"
                value={preferences.diet}
                onChange={(e) => updatePreferences('diet', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {loading ? 'AI is analyzing...' : 'Find Perfect Properties'}
        </button>
      </form>

      {/* AI Recommendations Display */}
      {recommendations && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-semibold">AI Recommendations</h3>
          </div>

          {/* Property Type Recommendations */}
          {recommendations.recommendations && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <h4 className="font-semibold text-lg mb-3">Recommended Property Types</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-lg text-blue-800">{rec.propertyType}</h5>
                    <p className="text-sm text-gray-600 mt-1">{rec.locationNotes}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.amenities.map((amenity, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    {rec.specialConsiderations && (
                      <p className="text-xs text-gray-500 mt-2 italic">{rec.specialConsiderations}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Tips */}
          {recommendations.searchTips && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-lg mb-3">AI Search Tips</h4>
              <ul className="space-y-2">
                {recommendations.searchTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Matching Properties */}
          {recommendations.matchingProperties && recommendations.matchingProperties.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
              <h4 className="font-semibold text-lg mb-3">Available Properties</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.matchingProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-lg">{property.name}</h5>
                    <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
                    <p className="text-sm text-gray-500 mt-1">{property.property_type}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-green-600">${property.price_per_night}/night</span>
                      <span className="text-sm text-gray-500">{property.max_guests} guests</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
