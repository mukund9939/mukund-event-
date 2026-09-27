import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { User, Mail, Building2, Shield, Save, Loader2 } from 'lucide-react'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    college: profile?.college || '',
  })
  const [saving, setSaving] = useState(false)

  function update(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: form.full_name, college: form.college })
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-gray-500 mb-8">Manage your account details</p>

      <div className="card p-8">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'User'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                profile?.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                <Shield className="w-3 h-3" />
                {profile?.role === 'admin' ? 'Admin' : 'Participant'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.full_name} onChange={update('full_name')} className="input pl-10" required />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={profile?.email || ''} className="input pl-10 bg-gray-50 cursor-not-allowed" disabled />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="label">College</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.college} onChange={update('college')} className="input pl-10" />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Account Info</h3>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Member since {new Date(profile?.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>User ID: <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{user?.id?.slice(0, 8)}...</code></p>
        </div>
      </div>
    </div>
  )
}
