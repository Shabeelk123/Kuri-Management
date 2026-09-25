import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!supabase) return
    // The recovery link's token establishes a temporary session; this fires once it's parsed.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured yet — see docs/01-SETUP.md.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setDone(true)
    await supabase.auth.signOut()
  }

  return (
    <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-safe pb-safe px-margin bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-8 pt-8">
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary tracking-tight mb-2">
          Set a new password
        </h1>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm mb-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container" />

          {done ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <Icon name="check_circle" className="text-3xl text-primary" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                Your password has been updated. Sign in with your new password.
              </p>
              <Button size="md" onClick={() => navigate('/')}>
                Go to sign in
              </Button>
            </div>
          ) : !ready ? (
            <p className="font-body-md text-body-md text-on-surface-variant">
              Open this page from the reset link in your email — the link contains what's needed to
              verify it's you.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="font-label-lg text-label-lg text-primary" htmlFor="new-password">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="w-full h-12 mt-1 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="font-label-lg text-label-lg text-primary" htmlFor="confirm-new-password">
                  Confirm new password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  className="w-full h-12 mt-1 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              {error && <p className="font-label-md text-label-md text-error">{error}</p>}
              <Button type="submit" disabled={submitting} className="mt-1">
                {submitting ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
