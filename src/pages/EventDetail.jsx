import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CATEGORY_COLORS, formatDateTime, isEventPast } from '../lib/constants'
import { Skeleton } from '../components/Skeleton'
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Tag,
  CheckCircle,
  XCircle,
  Loader2,
  UserCheck,
  Clock,
} from 'lucide-react'

export default function EventDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [regCount, setRegCount] = useState(0)
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: ev, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !ev) {
        toast.error('Event not found')
        navigate('/events')
        return
      }

      setEvent(ev)

      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
      setRegCount(count || 0)

      if (user) {
        const { data: reg } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .single()
        setIsRegistered(!!reg)
      }

      setLoading(false)
    }
    load()
  }, [id, user])

  async function handleRegister() {
    if (!user) {
      toast.info('Please sign in to register for events')
      navigate('/login')
      return
    }
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('registrations')
        .insert({ event_id: id, user_id: user.id })
      if (error) throw error
      setIsRegistered(true)
      setRegCount(prev => prev + 1)
      toast.success('Successfully registered! See you there.')
    } catch (err) {
      if (err.message?.includes('duplicate') || err.code === '23505') {
        toast.warning('You are already registered for this event')
      } else {
        toast.error(err.message || 'Registration failed')
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id)
      if (error) throw error
      setIsRegistered(false)
      setRegCount(prev => Math.max(0, prev - 1))
      toast.success('Registration cancelled')
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!event) return null

  const past = isEventPast(event.date)
  const full = regCount >= event.capacity
  const fillPercent = Math.min((regCount / event.capacity) * 100, 100)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      {/* Hero Image */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
          alt={event.title}
          className="w-full h-64 sm:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold mb-3 ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.General}`}>
            {event.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About This Event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {event.tags?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <div className="card p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(event.date)}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {past ? 'This event has ended' : 'Mark your calendar'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{event.location}</p>
                <p className="text-xs text-gray-500 mt-0.5">Venue</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{regCount} / {event.capacity} registered</p>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fillPercent >= 90 ? 'bg-red-500' : fillPercent >= 60 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {full ? 'Event is full' : `${event.capacity - regCount} spots remaining`}
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="card p-6">
            {past ? (
              <div className="flex items-center gap-3 text-gray-500">
                <Clock className="w-5 h-5" />
                <p className="text-sm font-medium">This event has ended</p>
              </div>
            ) : isRegistered ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                  <p className="text-sm font-semibold">You're registered!</p>
                </div>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Cancel Registration
                </button>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={actionLoading || full}
                className="btn-primary w-full"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : full ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {actionLoading ? 'Processing...' : full ? 'Event Full' : 'Register Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
