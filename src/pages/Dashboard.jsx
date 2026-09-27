import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/constants'
import { Skeleton } from '../components/Skeleton'
import {
  CalendarDays,
  Ticket,
  User,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ bookings: 0, upcoming: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: regs } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false })
        .limit(5)

      const bookings = regs || []
      setRecentBookings(bookings)

      const upcoming = bookings.filter(r => new Date(r.events?.date) > new Date()).length
      const { count: totalBookings } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setStats({ bookings: totalBookings || 0, upcoming })
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-500 mt-1">Here's your activity overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: stats.bookings, icon: Ticket, color: 'text-indigo-600 bg-indigo-50', link: '/my-bookings' },
          { label: 'Upcoming Events', value: stats.upcoming, icon: CalendarDays, color: 'text-emerald-600 bg-emerald-50', link: '/my-bookings' },
          { label: 'Profile', value: profile?.college || '—', icon: User, color: 'text-purple-600 bg-purple-50', link: '/profile', small: true },
        ].map(stat => (
          <Link key={stat.label} to={stat.link} className="card p-5 flex items-center gap-4 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-gray-900 ${stat.small ? 'text-sm truncate' : 'text-2xl'}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/events" className="btn-primary text-sm">
          <CalendarDays className="w-4 h-4" /> Browse Events
        </Link>
        <Link to="/my-bookings" className="btn-secondary text-sm">
          <Ticket className="w-4 h-4" /> My Bookings
        </Link>
        <Link to="/profile" className="btn-secondary text-sm">
          <User className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Ticket className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm mt-1">Start by browsing available events.</p>
            <Link to="/events" className="btn-primary text-sm mt-4 inline-flex">
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentBookings.map(booking => (
              <Link
                key={booking.id}
                to={`/events/${booking.events?.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <img
                  src={booking.events?.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=80'}
                  alt={booking.events?.title}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{booking.events?.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(booking.events?.date)}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {booking.events?.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(booking.events?.date) > new Date() ? 'Upcoming' : 'Past'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
