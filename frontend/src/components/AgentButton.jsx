import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, X } from 'lucide-react'
import api from '../services/api'

export default function AgentButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    booking: { location: '', startDate: '', endDate: '', partyType: 'family', guests: 2 },
    preferences: {
      budget: 'medium',
      interests: 'museums, parks',
      mobility: 'stroller-friendly',
      diet: 'vegan',
    },
  })
  const [result, setResult] = useState(null)

  const set = (path, value) => {
    const [a, b] = path.split('.')
    setForm((prev) => ({ ...prev, [a]: { ...prev[a], [b]: value } }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/agent/concierge', form)
      setResult(data)
    } catch (e) {
      setResult({ error: e?.response?.data?.message || 'Failed to fetch plan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-40 rounded-full p-4 bg-brand-600 text-white shadow-xl focus-ring"
        onClick={() => setOpen(true)}
        aria-label="Open AI Concierge"
      >
        <Bot className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
            aria-label="AI Concierge Panel"
          >
            <header className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Hostly AI Concierge</h3>
              <button
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Input form */}
              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Location"
                    value={form.booking.location}
                    onChange={(e) => set('booking.location', e.target.value)}
                    className="rounded-xl border px-3 py-2 col-span-2"
                    required
                  />
                  <input
                    type="date"
                    value={form.booking.startDate}
                    onChange={(e) => set('booking.startDate', e.target.value)}
                    className="rounded-xl border px-3 py-2"
                    required
                  />
                  <input
                    type="date"
                    value={form.booking.endDate}
                    onChange={(e) => set('booking.endDate', e.target.value)}
                    className="rounded-xl border px-3 py-2"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    value={form.booking.guests}
                    onChange={(e) => set('booking.guests', Number(e.target.value))}
                    className="rounded-xl border px-3 py-2"
                    required
                  />
                  <select
                    value={form.booking.partyType}
                    onChange={(e) => set('booking.partyType', e.target.value)}
                    className="rounded-xl border px-3 py-2 col-span-2"
                  >
                    <option value="solo">Solo</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="group">Group</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={form.preferences.budget}
                    onChange={(e) => set('preferences.budget', e.target.value)}
                    className="rounded-xl border px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input
                    placeholder="Diet (e.g., vegan)"
                    value={form.preferences.diet}
                    onChange={(e) => set('preferences.diet', e.target.value)}
                    className="rounded-xl border px-3 py-2"
                  />
                  <input
                    placeholder="Interests"
                    value={form.preferences.interests}
                    onChange={(e) => set('preferences.interests', e.target.value)}
                    className="rounded-xl border px-3 py-2 col-span-2"
                  />
                  <input
                    placeholder="Mobility (e.g., wheelchair)"
                    value={form.preferences.mobility}
                    onChange={(e) => set('preferences.mobility', e.target.value)}
                    className="rounded-xl border px-3 py-2 col-span-2"
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full rounded-xl bg-brand-600 text-white px-4 py-2"
                >
                  {loading ? 'Generating...' : 'Get plan'}
                </button>
              </form>

              {/* Display results */}
              {result && !result.error && (
                <div className="space-y-4">
                  <section>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Itinerary
                    </h4>
                    {result.plan?.map((day, idx) => (
                      <div key={idx} className="mt-2 p-3 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50">
                        <p className="font-medium text-indigo-800">
                          Day {idx + 1} — {day.date}
                        </p>
                        <ul className="list-disc pl-5 text-sm text-gray-700 mt-2 space-y-1">
                          <li><span className="font-medium text-orange-600">Morning:</span> {day.morning}</li>
                          <li><span className="font-medium text-blue-600">Afternoon:</span> {day.afternoon}</li>
                          <li><span className="font-medium text-purple-600">Evening:</span> {day.evening}</li>
                        </ul>
                      </div>
                    ))}
                  </section>

                  <section>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      Activities
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {result.activities?.map((a, i) => (
                        <article key={i} className="p-3 rounded-xl border bg-gradient-to-r from-yellow-50 to-orange-50">
                          <p className="font-medium text-orange-800">{a.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{a.address}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {a.tags?.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                            {a.childFriendly && (
                              <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                                Child-friendly
                              </span>
                            )}
                            {a.wheelchair && (
                              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                                Wheelchair accessible
                              </span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Restaurants
                    </h4>
                    <div className="space-y-2">
                      {result.restaurants?.map((r, i) => (
                        <div key={i} className="p-3 rounded-xl border bg-gradient-to-r from-red-50 to-pink-50">
                          <p className="font-medium text-red-800">{r.name}</p>
                          <p className="text-sm text-gray-600">{r.cuisine} • {r.price}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Packing Checklist
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {result.checklist?.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm text-gray-700">{c}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Print Plan
                    </button>
                    <button 
                      onClick={() => setResult(null)}
                      className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      Generate New Plan
                    </button>
                  </div>
                </div>
              )}

              {result?.error && <p className="text-red-600">{result.error}</p>}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
