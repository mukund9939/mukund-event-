import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#14b8a6']

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [categoryData, setCategoryData] = useState([])
  const [eventRegData, setEventRegData] = useState([])
  const [timelineData, setTimelineData] = useState([])

  useEffect(() => {
    async function load() {
      const { data: events } = await supabase.from('events').select('id, title, category, capacity')
      const { data: registrations } = await supabase.from('registrations').select('event_id, registered_at')

      if (!events || !registrations) {
        setLoading(false)
        return
      }

      const regCountByEvent = {}
      registrations.forEach(r => {
        regCountByEvent[r.event_id] = (regCountByEvent[r.event_id] || 0) + 1
      })

      const catCounts = {}
      events.forEach(e => {
        catCounts[e.category] = (catCounts[e.category] || 0) + 1
      })
      setCategoryData(Object.entries(catCounts).map(([name, value]) => ({ name, value })))

      const topEvents = events
        .map(e => ({
          name: e.title.length > 20 ? e.title.slice(0, 18) + '...' : e.title,
          registrations: regCountByEvent[e.id] || 0,
          capacity: e.capacity,
        }))
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 8)
      setEventRegData(topEvents)

      const dateMap = {}
      registrations.forEach(r => {
        const day = new Date(r.registered_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        dateMap[day] = (dateMap[day] || 0) + 1
      })
      const timeline = Object.entries(dateMap)
        .map(([date, count]) => ({ date, registrations: count }))
        .slice(-14)
      setTimelineData(timeline)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  const noData = categoryData.length === 0 && eventRegData.length === 0 && timelineData.length === 0

  if (noData) {
    return (
      <div className="text-center py-20 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900">No Data Yet</h2>
        <p className="text-sm mt-1">Create some events and get registrations to see analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Category */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Events by Category</h3>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-20">No events yet</p>
          )}
        </div>

        {/* Registrations per Event */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-gray-900">Registrations by Event</h3>
          </div>
          {eventRegData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={eventRegData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="registrations" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                <Bar dataKey="capacity" fill="#e0e7ff" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-20">No registrations yet</p>
          )}
        </div>
      </div>

      {/* Registrations Over Time */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-gray-900">Registrations Over Time</h3>
        </div>
        {timelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#regGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500 text-center py-20">No registration timeline data yet</p>
        )}
      </div>
    </div>
  )
}
