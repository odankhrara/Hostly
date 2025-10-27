import React from 'react'

export default function BookingStatusBadge({ status }) {
  const map = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={`px-2 py-1 rounded-lg text-xs font-medium ${
        map[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  )
}
