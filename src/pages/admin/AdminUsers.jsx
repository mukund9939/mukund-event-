import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../lib/constants'
import { Skeleton } from '../../components/Skeleton'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Users, Shield, ShieldOff, Search } from 'lucide-react'

export default function AdminUsers() {
  const { user } = useAuth()
  const toast = useToast()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleChange, setRoleChange] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setProfiles(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleRoleChange() {
    if (!roleChange) return
    const { id, newRole } = roleChange
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id)
      if (error) throw error
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p))
      toast.success(`User role updated to ${newRole}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update role')
    } finally {
      setRoleChange(null)
    }
  }

  const filtered = profiles.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      p.full_name?.toLowerCase().includes(s) ||
      p.email?.toLowerCase().includes(s) ||
      p.college?.toLowerCase().includes(s)
    )
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    )
  }

  const adminCount = profiles.filter(p => p.role === 'admin').length
  const participantCount = profiles.filter(p => p.role === 'participant').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Users ({profiles.length})</h2>
          <p className="text-sm text-gray-500">{adminCount} admin{adminCount !== 1 ? 's' : ''}, {participantCount} participant{participantCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-10"
          placeholder="Search by name, email, or college..."
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" message="No matching users." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">College</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Joined</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const isCurrentUser = p.id === user?.id
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            p.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            {p.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {p.full_name || '—'}
                              {isCurrentUser && <span className="text-xs text-gray-400 ml-1">(you)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{p.email}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{p.college || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {p.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">{formatDate(p.created_at)}</td>
                      <td className="px-5 py-3 text-right">
                        {!isCurrentUser && (
                          p.role === 'participant' ? (
                            <button
                              onClick={() => setRoleChange({ id: p.id, newRole: 'admin', name: p.full_name })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              <Shield className="w-3 h-3" /> Promote
                            </button>
                          ) : (
                            <button
                              onClick={() => setRoleChange({ id: p.id, newRole: 'participant', name: p.full_name })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <ShieldOff className="w-3 h-3" /> Demote
                            </button>
                          )
                        )}
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
        open={!!roleChange}
        title={`Change Role`}
        message={`Change ${roleChange?.name || 'this user'}'s role to "${roleChange?.newRole}"?`}
        onConfirm={handleRoleChange}
        onCancel={() => setRoleChange(null)}
      />
    </div>
  )
}
