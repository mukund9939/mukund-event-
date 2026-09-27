import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { formatDate, formatTime } from '../../lib/constants'
import { Skeleton } from '../../components/Skeleton'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Ticket, Trash2, Search, Download } from 'lucide-react'

export default function AdminRegistrations() {
  const toast = useToast()
  const [registrations, setRegistrations] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEvent, setFilterEvent] = useState('')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: regs } = await supabase
        .from('registrations')
        .select('*, profiles(full_name, email, college), events(title, date)')
        .order('registered_at', { ascending: false })
      setRegistrations(regs || [])

      const { data: evts } = await supabase.from('events').select('id, title').order('title')
      setEvents(evts || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleDelete() {
    if (!deleteId) return
    try {
      const { error } = await supabase.from('registrations').delete().eq('id', deleteId)
      if (error) throw error
      setRegistrations(prev => prev.filter(r => r.id !== deleteId))
      toast.success('Registration removed')
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleteId(null)
    }
  }

  const filtered = registrations.filter(r => {
    if (filterEvent && r.event_id !== filterEvent) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        r.profiles?.full_name?.toLowerCase().includes(s) ||
        r.profiles?.email?.toLowerCase().includes(s) ||
        r.profiles?.college?.toLowerCase().includes(s) ||
        r.events?.title?.toLowerCase().includes(s)
      )
    }
    return true
  })

  function exportCSV() {
    const header = 'Name,Email,College,Event,Registered At\n'
    const rows = filtered.map(r =>
      `"${r.profiles?.full_name || ''}","${r.profiles?.email || ''}","${r.profiles?.college || ''}","${r.events?.title || ''}","${new Date(r.registered_at).toLocaleString()}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'registrations.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Registrations ({filtered.length})</h2>
        <button onClick={exportCSV} className="btn-secondary text-sm" disabled={filtered.length === 0}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search by name, email, or college..."
          />
        </div>
        <select
          value={filterEvent}
          onChange={e => setFilterEvent(e.target.value)}
          className="input w-full sm:w-64"
        >
          <option value="">All Events</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No registrations found"
          message={search || filterEvent ? 'Try adjusting your filters.' : 'No one has registered for any event yet.'}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">College</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Event</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((reg, i) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                          {reg.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{reg.profiles?.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{reg.profiles?.email || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{reg.profiles?.college || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-700 font-medium max-w-[180px] truncate">{reg.events?.title || '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(reg.registered_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(reg.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Remove Registration"
        message="This will remove this student's registration for this event."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        danger
      />
    </div>
  )
}
