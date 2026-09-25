import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Button from './Button'
import { supabase } from '../lib/supabase'

export default function EmailAuthForm({ role = 'member' }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [checkInbox, setCheckInbox] = useState(false)

  async function afterAuthenticated(user) {
    if (role === 'organizer') {
      const { error: profileError } = await supabase
        .from('organizers')
        .upsert({ id: user.id, email: user.email, name: name || user.email })
      if (profileError) throw profileError
    }
    navigate(role === 'organizer' ? '/organizer' : '/member/kuris')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured yet — see docs/01-SETUP.md.')
      return
    }
    setError(null)
    setCheckInbox(false)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signin') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        await afterAuthenticated(data.user)
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        if (data.session) {
          await afterAuthenticated(data.user)
        } else {
          setCheckInbox(true)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm mb-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container" />

      <div className="flex items-center bg-surface-container-high p-1 rounded-full w-fit mb-4">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all ${
            mode === 'signin' ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all ${
            mode === 'signup' ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
          }`}
        >
          Create account
        </button>
      </div>

      {checkInbox ? (
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <Icon name="mark_email_read" className="text-3xl text-primary" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            We sent a confirmation link to <strong className="text-on-surface">{email}</strong>. Confirm
            it, then come back and sign in.
          </p>
          <Button size="md" onClick={() => setMode('signin')}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div>
              <label className="font-label-lg text-label-lg text-primary" htmlFor="email-name">
                Your name
              </label>
              <input
                id="email-name"
                className="w-full h-12 mt-1 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
          )}
          <div>
            <label className="font-label-lg text-label-lg text-primary" htmlFor="email-input">
              Email
            </label>
            <input
              id="email-input"
              type="email"
              className="w-full h-12 mt-1 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="font-label-lg text-label-lg text-primary" htmlFor="password-input">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              className="w-full h-12 mt-1 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="font-label-lg text-label-lg text-primary" htmlFor="confirm-password-input">
                Confirm password
              </label>
              <input
                id="confirm-password-input"
                type="password"
                className="w-full h-12 mt-1 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          )}

          {error && <p className="font-label-md text-label-md text-error">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      )}
    </div>
  )
}
