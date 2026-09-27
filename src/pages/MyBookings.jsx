import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate, formatTime, CATEGORY_COLORS, isEventPast } from '../lib/constants'
import { Skeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  Ticket,
  Calendar,
  MapPin,
  XCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'

export default function MyBookings() {
  const { user } = useAuth()
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelId, setCancelId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false })

      setBookings(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  async function handleCancel() {
    if (!cancelId) return
    setCancelling(true)
    try {
      const { error } = await supabase.from('registrations').delete().eq('id', cancelId)
      if (error) throw error
      setBookings(prev => prev.filter(b => b.id !== cancelId))
      toast.success('Registration cancelled')
    } catch (err) {
      toast.error(err.message || 'Failed to cancel')
    } finally {
      setCancelling(false)
      setCancelId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    )
  }

  const upcoming = bookings.filter(b => !isEventPast(b.events?.date))
  const past = bookings.filter(b => isEventPast(b.events?.date))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-8">Manage your event registrations</p>

      {bookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No bookings yet"
          message="You haven't registered for any events. Start exploring!"
          action={
            <Link to="/events" className="btn-primary text-sm">
              Browse Events
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map(booking => (
                  <BookingCard key={booking.id} booking={booking} onCancel={() => setCancelId(booking.id)} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Past ({past.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {past.map(booking => (
                  <BookingCard key={booking.id} booking={booking} isPast />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel Registration"
        message="Are you sure you want to cancel this registration? You can always register again if spots are available."
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
        danger
      />
    </div>
  )
}

function BookingCard({ booking, onCancel, isPast }) {
  const event = booking.events
  if (!event) return null

  return (
    <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <img
        src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=80'}
        alt={event.title}
        className="w-full sm:w-20 h-32 sm:h-20 rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.General}`}>
            {event.category}
          </span>
          {isPast && <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">Past</span>}
        </div>
        <h3 className="text-base font-bold text-gray-900 truncate">{event.title}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(event.date)} at {formatTime(event.date)}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Link to={`/events/${event.id}`} className="btn-secondary text-xs px-3 py-2 flex-1 sm:flex-none">
          <ExternalLink className="w-3.5 h-3.5" /> View
        </Link>
        {!isPast && onCancel && (
          <button onClick={onCancel} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex-1 sm:flex-none">
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}
