import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import Button from '../../components/Button'
import { supabase } from '../../lib/supabase'

export default function Login({ role = 'member' }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  async function handleGoogleSignIn() {
    if (!supabase) {
      setError('Supabase is not configured yet — see docs/01-SETUP.md.')
      return
    }
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    })
    if (oauthError) setError(oauthError.message)
  }

  async function handleSendCode(e) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured yet — see docs/01-SETUP.md.')
      return
    }
    setSending(true)
    setError(null)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setSending(false)
    if (otpError) {
      setError(otpError.message)
      return
    }
    navigate(role === 'organizer' ? '/organizer/verify' : '/member/verify', { state: { email, role } })
  }

  return (
    <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-safe pb-safe px-margin bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-8">
        <BackToRoleChoice />
        <div className="flex flex-col pt-2 pb-4">
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary tracking-tight mb-2">
            {role === 'organizer' ? 'Organizer Sign In' : 'Sign In to Kuri Ledger'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            {role === 'organizer'
              ? 'Sign in to manage your Kuri groups and members.'
              : 'Sign in to view your savings groups, track monthly turns, and accept community invites.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full h-14 rounded-xl bg-surface-container-lowest border border-surface-dim shadow-sm flex items-center justify-center gap-3 font-label-lg text-label-lg font-bold text-on-surface active:scale-[0.985] transition-transform mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              fill="#4285F4"
              d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 3-4.32 3-7.31z"
            />
            <path
              fill="#34A853"
              d="M10 20c2.7 0 4.96-.9 6.62-2.44l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.06v2.59A10 10 0 0 0 10 20z"
            />
            <path
              fill="#FBBC05"
              d="M4.41 11.9a6 6 0 0 1 0-3.8V5.51H1.06a10 10 0 0 0 0 8.98l3.35-2.6z"
            />
            <path
              fill="#EA4335"
              d="M10 3.98c1.47 0 2.79.5 3.82 1.5l2.86-2.86C14.95.99 12.7 0 10 0 6.09 0 2.7 2.24 1.06 5.51l3.35 2.6C5.2 5.75 7.4 3.98 10 3.98z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-surface-dim" />
          <span className="font-label-md text-label-md text-on-surface-variant">OR</span>
          <div className="flex-1 h-px bg-surface-dim" />
        </div>

        <form
          onSubmit={handleSendCode}
          className="bg-surface-container-lowest rounded-xl p-5 shadow-sm mb-5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container" />
          <div className="flex items-center justify-between mb-4">
            <label className="font-label-lg text-label-lg text-primary font-bold" htmlFor="email-input">
              Email Address
            </label>
            <Icon name="mail" className="text-secondary text-xl" />
          </div>
          <input
            aria-label="Email address"
            type="email"
            className="w-full h-14 px-4 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none mb-3"
            id="email-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex items-start gap-2 mb-5">
            <Icon name="mark_email_read" className="text-on-surface-variant text-lg mt-0.5" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              We will send a 6-digit verification code to your email. No passwords needed.
            </p>
          </div>
          {error && <p className="font-label-md text-label-md text-error mb-3">{error}</p>}
          <Button type="submit" disabled={sending} icon={<Icon name="arrow_forward" className="text-lg" />}>
            {sending ? 'Sending…' : 'Send Verification Code'}
          </Button>
        </form>

        <div className="rounded-xl bg-surface-container p-4 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
            <Icon name="lock" className="text-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg text-primary font-bold mb-0.5">
              Safe &amp; Secure
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
              No passwords to remember. Sign in with your Google account or a one-time email code.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function BackToRoleChoice() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      aria-label="Back"
      className="w-11 h-11 -ml-2 mt-2 rounded-full flex items-center justify-center text-primary active:bg-surface-container-high transition-colors self-start"
    >
      <Icon name="arrow_back_ios_new" className="text-2xl" />
    </button>
  )
}
