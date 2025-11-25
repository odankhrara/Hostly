import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getOwnerProperties } from '../store/slices/propertiesSlice'
import { fetchOwnerBookings, acceptBooking, cancelBooking } from '../store/slices/bookingsSlice'
import { selectOwnerProperties, selectPropertiesLoading } from '../store/selectors'
import { selectOwnerBookings, selectBookingsLoading } from '../store/selectors'
import BookingStatusBadge from '../components/BookingStatusBadge'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/imageUtils'

export default function OwnerDashboard() {
  const dispatch = useAppDispatch()
  const properties = useAppSelector(selectOwnerProperties)
  const propertiesLoading = useAppSelector(selectPropertiesLoading)
  const bookings = useAppSelector(selectOwnerBookings)
  const bookingsLoading = useAppSelector(selectBookingsLoading)

  useEffect(() => {
    dispatch(getOwnerProperties())
    dispatch(fetchOwnerBookings())
  }, [dispatch])

  const handleRespond = async (id, action) => {
    try {
      if (action === 'ACCEPT') {
        await dispatch(acceptBooking(id))
      } else if (action === 'CANCEL') {
        await dispatch(cancelBooking(id))
      }
      // Refresh bookings after action
      dispatch(fetchOwnerBookings())
    } catch (error) {
      console.error('Error responding to booking:', error)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Properties</h2>
        <Link to="/add-property" className="px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700">
          Add property
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {propertiesLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No properties yet. Add your first property!</div>
        ) : (
          properties.map(p => (
            <article key={p.id} className="bg-white rounded-2xl border p-4">
              <img 
                src={getImageUrl(p.main_image)} 
                alt={p.name} 
                className="w-full h-32 object-cover rounded-lg mb-3" 
              />
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.location}</p>
              <p className="mt-1 text-sm">${p.price_per_night}/night</p>
              <p className="text-xs text-gray-500 mt-1">{p.bedrooms} bd • {p.bathrooms} ba • {p.max_guests} guests</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {p.status}
                </span>
                <span className="text-xs text-gray-500">{p.total_bookings} bookings</span>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-3">Booking Requests</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Property</th>
              <th className="p-2">Guest</th>
              <th className="p-2">Dates</th>
              <th className="p-2">Guests</th>
              <th className="p-2">Price</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookingsLoading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">Loading bookings...</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">No booking requests yet</td>
              </tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.propertyName}</td>
                  <td className="p-2">{b.travelerName}</td>
                  <td className="p-2">{b.start_date} → {b.end_date}</td>
                  <td className="p-2">{b.num_guests}</td>
                  <td className="p-2 font-semibold text-brand-700">
                    ${b.total_price ? b.total_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </td>
                  <td className="p-2">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="p-2 space-x-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        handleRespond(b.id, 'ACCEPT')
                      }} 
                      className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={b.status !== 'pending'}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        handleRespond(b.id, 'CANCEL')
                      }} 
                      className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={b.status === 'cancelled'}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
