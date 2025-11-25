import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Star, Users, Home, Sparkles, ArrowRight, Shield } from 'lucide-react'
import { useAppSelector } from '../store/hooks'
import { selectUser } from '../store/selectors'

export default function Landing() {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()

  const handleTravelerClick = (e) => {
    e.preventDefault()
    if (user) {
      if (user.role === 'traveler' || user.role === 'both') {
        navigate('/traveler')
      } else {
        // User doesn't have traveler role, redirect to login
        navigate('/login?next=' + encodeURIComponent('/traveler'))
      }
    } else {
      // Not logged in, redirect to login with next parameter
      navigate('/login?next=' + encodeURIComponent('/traveler'))
    }
  }

  const handleOwnerClick = (e) => {
    e.preventDefault()
    if (user) {
      if (user.role === 'owner' || user.role === 'both') {
        navigate('/owner')
      } else {
        // User doesn't have owner role, redirect to login
        navigate('/login?next=' + encodeURIComponent('/owner'))
      }
    } else {
      // Not logged in, redirect to login with next parameter
      navigate('/login?next=' + encodeURIComponent('/owner'))
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-blue-50 -z-10" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700" />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-8rem)] py-12">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-7 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Travel Experience</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                Find Your Perfect
                <span className="block text-brand-600 bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent">
                  Stay Experience
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                Discover unique properties, plan your perfect trip, and manage your listings—all in one beautiful platform powered by AI.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">10K+ Properties</div>
                  <div className="text-sm text-gray-600">Worldwide</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <Star className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">4.8 Rating</div>
                  <div className="text-sm text-gray-600">Guest Reviews</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <Shield className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Secure</div>
                  <div className="text-sm text-gray-600">Bookings</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to="/signup" 
                className="group px-8 py-4 bg-brand-600 text-white rounded-2xl font-semibold text-lg hover:bg-brand-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-brand-300 hover:text-brand-700 transform hover:scale-105 transition-all duration-200 shadow-sm"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Side - Image & Side Navigation */}
          <div className="lg:col-span-5 space-y-6">
            {/* Property Image Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop" 
                  alt="Luxury property" 
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.9</span>
                    <span className="text-gray-300">(128 reviews)</span>
                  </div>
                  <h3 className="text-white font-bold text-xl">Luxury Beachfront Villa</h3>
                  <p className="text-gray-200 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    Malibu, California
                  </p>
                </div>
              </div>
            </div>

            {/* Side Navigation Cards */}
            <div className="space-y-4">
              {/* Traveler Card */}
              <div 
                onClick={handleTravelerClick}
                className="group block p-6 bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl border-2 border-transparent hover:border-brand-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-brand-600 rounded-xl group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">Traveler</h3>
                        <p className="text-sm text-gray-600">Explore & Book</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Discover unique stays, plan your perfect trip with AI assistance, and create unforgettable memories.
                    </p>
                    <div className="flex items-center gap-2 text-brand-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Explore Properties
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Card */}
              <div 
                onClick={handleOwnerClick}
                className="group block p-6 bg-gradient-to-br from-blue-50 to-brand-50 rounded-2xl border-2 border-transparent hover:border-blue-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                        <Home className="w-6 h-6 text-white" />
                      </div>
      <div>
                        <h3 className="font-bold text-xl text-gray-900">Owner</h3>
                        <p className="text-sm text-gray-600">List & Manage</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      List your property, manage bookings, and grow your rental business with smart tools.
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Manage Properties
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  )
}
