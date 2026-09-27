import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import EventCard from '../components/EventCard'
import { EventCardSkeleton } from '../components/Skeleton'
import {
  CalendarDays,
  Users,
  Building2,
  Trophy,
  Search,
  UserPlus,
  PartyPopper,
  ArrowRight,
  Monitor,
  Music,
  Dumbbell,
  BookOpen,
  Award,
  Briefcase,
  Sparkles,
} from 'lucide-react'

const categories = [
  { name: 'Technology', icon: Monitor, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
  { name: 'Cultural', icon: Music, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
  { name: 'Sports', icon: Dumbbell, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50' },
  { name: 'Workshop', icon: BookOpen, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
  { name: 'Competition', icon: Award, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50' },
  { name: 'Business', icon: Briefcase, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50' },
]

const steps = [
  { icon: Search, title: 'Browse Events', desc: 'Explore upcoming events across all categories and departments.' },
  { icon: UserPlus, title: 'Register Instantly', desc: 'Sign up and register for events with a single click.' },
  { icon: PartyPopper, title: 'Attend & Enjoy', desc: 'Show up, participate, and make unforgettable memories.' },
]

export default function Home() {
  const [events, setEvents] = useState([])
  const [regCounts, setRegCounts] = useState({})
  const [stats, setStats] = useState({ events: 0, registrations: 0, capacity: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(6)

      setEvents(eventsData || [])

      if (eventsData?.length) {
        const ids = eventsData.map(e => e.id)
        const { data: regs } = await supabase
          .from('registrations')
          .select('event_id')
          .in('event_id', ids)

        const counts = {}
        regs?.forEach(r => { counts[r.event_id] = (counts[r.event_id] || 0) + 1 })
        setRegCounts(counts)
      }

      const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true })
      const { count: totalRegs } = await supabase.from('registrations').select('*', { count: 'exact', head: true })
      const { data: capData } = await supabase.from('events').select('capacity')
      const totalCap = capData?.reduce((s, e) => s + e.capacity, 0) || 0

      setStats({ events: totalEvents || 0, registrations: totalRegs || 0, capacity: totalCap })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.06)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              Your Campus Event Hub
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              Discover. Register.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">
                Experience.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mt-6 leading-relaxed max-w-2xl">
              One platform for discovering, managing, and experiencing unforgettable campus events.
              Never miss what matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-indigo-700 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Explore Events
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80V40C1440 40 1200 0 720 0C240 0 0 40 0 40V80Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: stats.events, icon: CalendarDays, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Registrations', value: stats.registrations, icon: Users, color: 'text-purple-600 bg-purple-50' },
            { label: 'Total Capacity', value: stats.capacity.toLocaleString(), icon: Building2, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Categories', value: '6+', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
          ].map(stat => (
            <div key={stat.label} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="text-gray-500 mt-2">Don't miss out on these exciting events happening soon.</p>
          </div>
          <Link to="/events" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No upcoming events yet</p>
            <p className="text-sm mt-1">Check back soon for new events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} registrationCount={regCounts[event.id] || 0} />
            ))}
          </div>
        )}
        <div className="sm:hidden mt-6 text-center">
          <Link to="/events" className="btn-primary">
            View All Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="gradient-subtle py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-2">Find events that match your interests and passions.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={`/events?category=${cat.name}`}
                className="card p-6 text-center group hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br ${cat.color} shadow-lg`}>
                  <cat.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-500 mt-2">Three simple steps to get started.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-indigo-500/20 mx-auto">
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-sm font-bold text-indigo-600">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-6">{step.title}</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 gradient-primary" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%221.5%22%20fill%3D%22rgba(255%2C255%2C255%2C0.1)%22%2F%3E%3C%2Fsvg%3E')]" />
          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Explore Campus Events?
            </h2>
            <p className="text-lg text-white/80 mt-4 max-w-2xl mx-auto">
              Join hundreds of students already discovering and registering for events.
              Your next experience is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-indigo-700 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
