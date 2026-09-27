import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../lib/constants'
import EventCard from '../components/EventCard'
import { EventCardSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { Search, SlidersHorizontal, CalendarDays, X } from 'lucide-react'

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [regCounts, setRegCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase.from('events').select('*').order('date', { ascending: true })

      if (category) query = query.eq('category', category)

      const { data } = await query
      let filtered = data || []

      if (search) {
        const s = search.toLowerCase()
        filtered = filtered.filter(
          e =>
            e.title.toLowerCase().includes(s) ||
            e.description?.toLowerCase().includes(s) ||
            e.location?.toLowerCase().includes(s)
        )
      }

      setEvents(filtered)

      if (filtered.length) {
        const ids = filtered.map(e => e.id)
        const { data: regs } = await supabase
          .from('registrations')
          .select('event_id')
          .in('event_id', ids)

        const counts = {}
        regs?.forEach(r => { counts[r.event_id] = (counts[r.event_id] || 0) + 1 })
        setRegCounts(counts)
      }

      setLoading(false)
    }
    load()
  }, [category])

  function handleSearch(e) {
    e.preventDefault()
    const s = search.toLowerCase()
    setSearchParams(prev => {
      if (s) prev.set('search', s)
      else prev.delete('search')
      return prev
    })
    setLoading(true)

    async function doSearch() {
      let query = supabase.from('events').select('*').order('date', { ascending: true })
      if (category) query = query.eq('category', category)
      const { data } = await query
      let filtered = data || []
      if (s) {
        filtered = filtered.filter(
          e =>
            e.title.toLowerCase().includes(s) ||
            e.description?.toLowerCase().includes(s) ||
            e.location?.toLowerCase().includes(s)
        )
      }
      setEvents(filtered)

      if (filtered.length) {
        const ids = filtered.map(e => e.id)
        const { data: regs } = await supabase
          .from('registrations')
          .select('event_id')
          .in('event_id', ids)
        const counts = {}
        regs?.forEach(r => { counts[r.event_id] = (counts[r.event_id] || 0) + 1 })
        setRegCounts(counts)
      }
      setLoading(false)
    }
    doSearch()
  }

  function clearFilters() {
    setSearch('')
    setCategory('')
    setSearchParams({})
  }

  const hasFilters = search || category

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
        <p className="text-gray-500 mt-1">Discover and register for campus events</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 pr-4"
            placeholder="Search events by name, description, or location..."
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-5 mb-8 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Category</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setCategory(''); setSearchParams(prev => { prev.delete('category'); return prev }) }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !category ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat)
                  setSearchParams(prev => { prev.set('category', cat); return prev })
                }}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events found"
          message={hasFilters ? 'Try adjusting your search or filters.' : 'No events have been created yet.'}
          action={hasFilters && (
            <button onClick={clearFilters} className="btn-secondary text-sm">
              Clear Filters
            </button>
          )}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} registrationCount={regCounts[event.id] || 0} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
