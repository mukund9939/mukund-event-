import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { CATEGORIES, formatDate, isEventPast } from '../../lib/constants'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Loader2,
  Save,
  Eye,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const EMPTY_FORM = {
  title: '', description: '', date: '', location: '', capacity: 100,
  category: 'Technology', image_url: '', tags: '',
}

export default function AdminEvents() {
  const { user } = useAuth()
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [regCounts, setRegCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  async function loadEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
    setEvents(data || [])

    if (data?.length) {
      const { data: regs } = await supabase
        .from('registrations')
        .select('event_id')
      const counts = {}
      regs?.forEach(r => { counts[r.event_id] = (counts[r.event_id] || 0) + 1 })
      setRegCounts(counts)
    }
    setLoading(false)
  }

  useEffect(() => { loadEvents() }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(event) {
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event.location,
      capacity: event.capacity,
      category: event.category,
      image_url: event.image_url || '',
      tags: event.tags?.join(', ') || '',
    })
    setEditingId(event.id)
    setShowForm(true)
  }

  function updateField(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      title: form.title,
      description: form.description,
      date: new Date(form.date).toISOString(),
      location: form.location,
      capacity: parseInt(form.capacity) || 100,
      category: form.category,
      image_url: form.image_url,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('events').update(payload).eq('id', editingId)
        if (error) throw error
        toast.success('Event updated!')
      } else {
        payload.created_by = user.id
        const { error } = await supabase.from('events').insert(payload)
        if (error) throw error
        toast.success('Event created!')
      }
      setShowForm(false)
      setEditingId(null)
      loadEvents()
    } catch (err) {
      toast.error(err.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const { error } = await supabase.from('events').delete().eq('id', deleteId)
      if (error) throw error
      toast.success('Event deleted')
      setEvents(prev => prev.filter(e => e.id !== deleteId))
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Events ({events.length})</h2>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-slide-up mb-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Event' : 'Create Event'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input type="text" value={form.title} onChange={updateField('title')} className="input" required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={updateField('description')} className="input min-h-[100px] resize-y" rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date & Time</label>
                  <input type="datetime-local" value={form.date} onChange={updateField('date')} className="input" required />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input type="text" value={form.location} onChange={updateField('location')} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Capacity</label>
                  <input type="number" value={form.capacity} onChange={updateField('capacity')} className="input" min={1} required />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={form.category} onChange={updateField('category')} className="input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Image URL</label>
                <input type="url" value={form.image_url} onChange={updateField('image_url')} className="input" placeholder="https://images.unsplash.com/..." />
              </div>
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={updateField('tags')} className="input" placeholder="tech, workshop, ai" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events Table */}
      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          message="Create your first event to get started."
          action={<button onClick={openCreate} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Create Event</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Event</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Registrations</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map(event => {
                  const past = isEventPast(event.date)
                  const count = regCounts[event.id] || 0
                  return (
                    <tr key={event.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=80'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">{event.title}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{event.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{event.category}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{formatDate(event.date)}</td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{count}/{event.capacity}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          past ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {past ? 'Past' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/events/${event.id}`} className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openEdit(event)} className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(event.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Event"
        message="This will permanently delete this event and all its registrations. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        danger
      />
    </div>
  )
}
