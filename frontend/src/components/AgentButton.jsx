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
                    <h4 className="font-semibold text-lg">Itinerary</h4>
                    {result.plan?.map((day, idx) => (
                      <div key={idx} className="mt-2 p-3 rounded-xl border">
                        <p className="font-medium">
                          Day {idx + 1} — {day.date}
                        </p>
                        <ul className="list-disc pl-5 text-sm text-gray-700">
                          <li>Morning: {day.morning}</li>
                          <li>Afternoon: {day.afternoon}</li>
                          <li>Evening: {day.evening}</li>
                        </ul>
                      </div>
                    ))}
                  </section>

                  <section>
                    <h4 className="font-semibold text-lg">Activities</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {result.activities?.map((a, i) => (
                        <article key={i} className="p-3 rounded-xl border">
                          <p className="font-medium">{a.title}</p>
                          <p className="text-sm text-gray-600">{a.address}</p>
                          <p className="text-xs mt-1">
                            {a.tags?.join(' • ')}{' '}
                            {a.childFriendly && '• Child-friendly'}{' '}
                            {a.wheelchair && '• Wheelchair accessible'}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="font-semibold text-lg">Restaurants</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {result.restaurants?.map((r, i) => (
                        <li key={i}>
                          {r.name} — {r.cuisine} — {r.price}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-lg">Packing checklist</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {result.checklist?.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </section>
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
