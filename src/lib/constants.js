export const CATEGORIES = [
  'Technology',
  'Cultural',
  'Sports',
  'Workshop',
  'Competition',
  'Business',
]

export const CATEGORY_COLORS = {
  Technology: 'bg-blue-100 text-blue-700',
  Cultural: 'bg-pink-100 text-pink-700',
  Sports: 'bg-emerald-100 text-emerald-700',
  Workshop: 'bg-amber-100 text-amber-700',
  Competition: 'bg-purple-100 text-purple-700',
  Business: 'bg-indigo-100 text-indigo-700',
  General: 'bg-gray-100 text-gray-700',
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`
}

export function isEventPast(dateStr) {
  return new Date(dateStr) < new Date()
}
