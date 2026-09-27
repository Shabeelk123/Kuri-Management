import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Icon from '../../components/Icon'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'

export default function Welcome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase || !user) return
    setSaving(true)
    setError(null)
    const { error: upsertError } = await supabase
      .from('organizers')
      .upsert({ id: user.id, email: user.email, name: name.trim() })
    setSaving(false)
    if (upsertError) {
      setError(upsertError.message)
      return
    }
    navigate('/organizer')
  }

  return (
    <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-safe pb-safe px-margin bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-8 pt-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
            <Icon name="person" className="text-3xl text-on-primary" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Welcome!</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xs">
            One quick thing — what should members call you?
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3"
        >
          <label className="font-label-lg text-label-lg text-primary" htmlFor="organizer-name">
            Your name
          </label>
          <input
            id="organizer-name"
            className="w-full h-14 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
            placeholder="e.g. Sunita Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {error && <p className="font-label-md text-label-md text-error">{error}</p>}
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </div>
    </main>
  )
}
