
import React from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'

export default function PropertyCard({ p, onFavToggle, isFav }) {
  return (
    <article className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <img
        src={getImageUrl(p.main_image)}
        alt={p.name}
        className="h-48 w-full object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{p.name}</h3>
          <button
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => onFavToggle(p)}
            className={`p-2 rounded-full ${
              isFav ? 'text-brand-700' : 'text-gray-500 hover:text-brand-700'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-gray-600">{p.location}</p>
        <p className="mt-2 font-semibold">
          ${p.price_per_night}/night • {p.bedrooms} bd • {p.bathrooms} ba
        </p>
        <Link
          to={`/property/${p.id}`}
          className="inline-block mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700"
        >
          View details
        </Link>
      </div>
    </article>
  )
}
