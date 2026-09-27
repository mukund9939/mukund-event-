import { Link } from 'react-router-dom'
import { CalendarDays, Github, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Campus<span className="text-indigo-400">Events</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-md">
              One platform for discovering, managing, and experiencing unforgettable campus events.
              Built for students, by students.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a href="mailto:events@campus.edu" className="flex items-center gap-1.5 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> events@campus.edu
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/events" className="text-sm hover:text-white transition-colors">Browse Events</Link></li>
              <li><Link to="/register" className="text-sm hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="text-sm hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/dashboard" className="text-sm hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Event Categories</h4>
            <ul className="space-y-2.5">
              <li className="text-sm">Technology</li>
              <li className="text-sm">Cultural</li>
              <li className="text-sm">Sports</li>
              <li className="text-sm">Workshops</li>
              <li className="text-sm">Competitions</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} CampusEvents. College Event Management System.
          </p>
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3" /> Built with React, Tailwind CSS & Supabase
          </div>
        </div>
      </div>
    </footer>
  )
}
