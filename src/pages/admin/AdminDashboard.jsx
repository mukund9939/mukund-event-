import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../lib/constants'
import { Skeleton } from '../../components/Skeleton'
import {
  CalendarDays,
  Ticket,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
  User,
  Database,
  Loader2,
} from 'lucide-react'

const SEED_EVENTS = [
  { title: 'TechFest 2026', description: 'The flagship technology festival featuring project exhibitions, tech talks by industry leaders, and hands-on workshops covering AI, blockchain, IoT, and cloud computing.', date: '2026-10-15T09:00:00', location: 'Main Auditorium & Tech Block', capacity: 300, category: 'Technology', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', tags: ['tech', 'festival', 'exhibition'] },
  { title: 'Inter-College Hackathon', description: 'A 24-hour coding marathon where teams compete to build innovative solutions. Prizes worth ₹2,00,000. Mentors from top tech companies.', date: '2026-10-22T08:00:00', location: 'Computer Science Block, Lab 1-4', capacity: 150, category: 'Competition', image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', tags: ['hackathon', 'coding', 'competition'] },
  { title: 'Annual Cultural Night', description: 'An evening of mesmerizing performances — classical and contemporary dance, live music, theatrical acts, stand-up comedy, and a fashion show.', date: '2026-11-01T17:00:00', location: 'Open Air Theatre', capacity: 500, category: 'Cultural', image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', tags: ['cultural', 'music', 'dance'] },
  { title: 'Sports Meet 2026', description: 'Two-day inter-departmental sports competition featuring cricket, football, basketball, badminton, athletics, and chess.', date: '2026-11-08T07:00:00', location: 'Sports Complex & Grounds', capacity: 400, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1461896836934-bd45ba8b9e4c?w=800&q=80', tags: ['sports', 'competition', 'athletics'] },
  { title: 'AI & Future Technology Workshop', description: 'Full-day intensive workshop on artificial intelligence, machine learning, and generative AI. Hands-on sessions with Python and TensorFlow.', date: '2026-11-15T10:00:00', location: 'Seminar Hall B', capacity: 80, category: 'Workshop', image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', tags: ['AI', 'workshop', 'machine-learning'] },
  { title: 'Entrepreneurship Summit', description: 'Hear from successful startup founders, VCs, and industry experts. Pitch your startup idea to a panel of investors.', date: '2026-11-22T09:30:00', location: 'Business School Auditorium', capacity: 200, category: 'Business', image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80', tags: ['entrepreneurship', 'startup', 'business'] },
  { title: 'Photography Competition', description: 'Showcase your best photographs across themes: Street, Nature, Portrait, and Abstract. Judged by professional photographers.', date: '2026-11-29T11:00:00', location: 'Art Gallery, Block C', capacity: 120, category: 'Cultural', image_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80', tags: ['photography', 'art', 'competition'] },
  { title: 'Coding Championship', description: 'Multi-round competitive programming contest. Problems ranging from easy to hard across data structures, algorithms, and mathematical reasoning.', date: '2026-12-05T10:00:00', location: 'Computer Lab 1 & 2', capacity: 100, category: 'Competition', image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', tags: ['coding', 'algorithms', 'contest'] },
  { title: 'Robotics Exhibition', description: 'Two-day robotics expo featuring student-built robots, drone demonstrations, and a line-follower robot race with Arduino and Raspberry Pi.', date: '2026-12-12T09:00:00', location: 'Innovation Lab & Corridor', capacity: 250, category: 'Technology', image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', tags: ['robotics', 'technology', 'exhibition'] },
  { title: 'Startup Pitch Day', description: 'Present your startup idea in a 5-minute pitch to angel investors and mentors. Get feedback, funding, and incubation opportunities.', date: '2026-12-19T14:00:00', location: 'Entrepreneurship Cell, Room 201', capacity: 60, category: 'Business', image_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80', tags: ['startup', 'pitch', 'investors'] },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [stats, setStats] = useState({ events: 0, registrations: 0, upcoming: 0, capacity: 0 })
  const [recentRegs, setRecentRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  async function loadData() {
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true })
    const { count: totalRegs } = await supabase.from('registrations').select('*', { count: 'exact', head: true })
    const { count: upcomingEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString())
    const { data: capData } = await supabase.from('events').select('capacity')
    const totalCap = capData?.reduce((s, e) => s + e.capacity, 0) || 0

    setStats({ events: totalEvents || 0, registrations: totalRegs || 0, upcoming: upcomingEvents || 0, capacity: totalCap })

    const { data: regs } = await supabase
      .from('registrations')
      .select('*, profiles(full_name, email, college), events(title)')
      .order('registered_at', { ascending: false })
      .limit(8)
    setRecentRegs(regs || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function seedDemoData() {
    setSeeding(true)
    try {
      const rows = SEED_EVENTS.map(e => ({ ...e, created_by: user.id }))
      const { error } = await supabase.from('events').insert(rows)
      if (error) throw error
      toast.success('10 demo events created!')
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to seed data')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats.events, icon: CalendarDays, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Total Registrations', value: stats.registrations, icon: Ticket, color: 'text-purple-600 bg-purple-50' },
          { label: 'Upcoming Events', value: stats.upcoming, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Capacity', value: stats.capacity.toLocaleString(), icon: Users, color: 'text-amber-600 bg-amber-50' },
        ].map(stat => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/events" className="btn-primary text-sm">
          <CalendarDays className="w-4 h-4" /> Manage Events
        </Link>
        <Link to="/admin/analytics" className="btn-secondary text-sm">
          <TrendingUp className="w-4 h-4" /> View Analytics
        </Link>
        {stats.events === 0 && (
          <button onClick={seedDemoData} disabled={seeding} className="btn-secondary text-sm">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? 'Seeding...' : 'Seed Demo Data (10 events)'}
          </button>
        )}
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Registrations</h2>
          <Link to="/admin/registrations" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentRegs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Ticket className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No registrations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Event</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">College</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentRegs.map(reg => (
                  <tr key={reg.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {reg.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reg.profiles?.full_name || '—'}</p>
                          <p className="text-xs text-gray-500">{reg.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">{reg.events?.title || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{reg.profiles?.college || '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{formatDate(reg.registered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
