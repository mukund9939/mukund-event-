import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import { CATEGORY_COLORS, formatDate, isEventPast } from '../lib/constants'

export default function EventCard({ event, registrationCount = 0 }) {
  const past = isEventPast(event.date)
  const full = registrationCount >= event.capacity
  const fillPercent = Math.min((registrationCount / event.capacity) * 100, 100)

  return (
    <Link
      to={`/events/${event.id}`}
      className="card overflow-hidden group flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.General}`}>
          {event.category}
        </span>
        {past && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-900/70 text-white">
            Past Event
          </span>
        )}
        {!past && full && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white">
            Full
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>

        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4 text-indigo-500" />
              {registrationCount}/{event.capacity}
            </div>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fillPercent >= 90 ? 'bg-red-500' : fillPercent >= 60 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
