import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import Button from '../../components/Button'
import { supabase } from '../../lib/supabase'

// Convert phone to a deterministic synthetic email for Supabase auth.
// Supabase email/password auth is used under the hood — no OTP cost.
// Requires "Confirm email" to be DISABLED in Supabase Dashboard → Auth → Email.
function syntheticEmail(phone) {
  return `${phone.replace(/\D/g, '')}@kuri.ph`
}

/** Single PIN dot */
function PinDot({ filled }) {
  return (
    <div
      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
        filled ? 'bg-primary border-primary scale-110' : 'bg-transparent border-outline'
      }`}
    />
  )
}

/** Numpad key */
function NumKey({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-16 rounded-2xl bg-surface-container-lowest border border-surface-dim shadow-sm font-headline-md text-headline-md text-on-surface font-bold active:scale-95 active:bg-surface-container transition-all"
    >
      {label}
    </button>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Login({ role = 'member' }) {
  const navigate = useNavigate()

  // tabs
  const [mode, setMode] = useState('signin') // 'signin' | 'register'

  // shared fields
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')          // register only

  // step within flow
  const [step, setStep] = useState('details')   // 'details' | 'pin' | 'confirm'

  // PIN state
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── helpers ──────────────────────────────────────────────────────────────────
  function cleanPhone(raw) {
    const d = raw.replace(/\D/g, '')
    if (d.startsWith('91') && d.length === 12) return d
    if (d.length === 10) return `91${d}`
    return d
  }

  function activePin() {
    return step === 'confirm' ? confirmPin : pin
  }

  function setActivePin(v) {
    step === 'confirm' ? setConfirmPin(v) : setPin(v)
  }

  function handleDigit(d) {
    const cur = activePin()
    if (cur.length < 4) setActivePin(cur + d)
  }

  function handleDelete() {
    const cur = activePin()
    if (cur.length > 0) {
      setActivePin(cur.slice(0, -1))
    } else if (step === 'confirm') {
      // Back to set-pin step
      setStep('pin')
      setPin('')
    }
  }

  function handleDetailsNext(e) {
    e.preventDefault()
    setError(null)
    const d = cleanPhone(phone)
    if (d.length < 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name.')
      return
    }
    setStep('pin')
  }

  // Auto-advance when 4 digits entered
  function onPinFilled(value) {
    if (value.length < 4) return
    if (mode === 'signin') {
      handleSignIn(value)
    } else if (step === 'pin') {
      setStep('confirm')
    } else {
      handleRegister(pin, value)
    }
  }

  // wrap digit handler to check auto-advance
  function pressDigit(d) {
    const cur = activePin()
    if (cur.length >= 4) return
    const next = cur + d
    setActivePin(next)
    onPinFilled(next)
  }

  // ── Supabase calls ────────────────────────────────────────────────────────────
  async function handleSignIn(enteredPin) {
    if (!supabase) { setError('Supabase not configured.'); return }
    setLoading(true)
    setError(null)
    const email = syntheticEmail(cleanPhone(phone))
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      // Password = phone + PIN so it's always ≥6 chars and tied to the number
      password: cleanPhone(phone) + enteredPin,
    })
    setLoading(false)
    if (signInError) {
      setError('Incorrect mobile number or PIN. Please try again.')
      setPin('')
      setStep('pin')
      return
    }
    navigate(role === 'organizer' ? '/organizer' : '/member/kuris')
  }

  async function handleRegister(chosenPin, confirmedPin) {
    if (chosenPin !== confirmedPin) {
      setError('PINs do not match. Please try again.')
      setPin('')
      setConfirmPin('')
      setStep('pin')
      return
    }
    if (!supabase) { setError('Supabase not configured.'); return }
    setLoading(true)
    setError(null)
    const email = syntheticEmail(cleanPhone(phone))
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      // Password = phone + PIN so it's always ≥6 chars and tied to the number
      password: cleanPhone(phone) + chosenPin,
      options: {
        data: { phone: cleanPhone(phone), name: name.trim() },
        // Disable email confirmation in Supabase Dashboard → Auth → Email
        emailRedirectTo: undefined,
      },
    })
    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }
    // If email confirmation is disabled, session is returned immediately.
    // If identities array is empty, this number is already registered.
    if (data?.user && data.user.identities?.length === 0) {
      setLoading(false)
      setError('This mobile number is already registered. Please sign in.')
      setMode('signin')
      setStep('details')
      setPin('')
      setConfirmPin('')
      return
    }
    setLoading(false)
    navigate(role === 'organizer' ? '/organizer/welcome' : '/member/kuris')
  }

  // ── UI helpers ────────────────────────────────────────────────────────────────
  function switchMode(m) {
    setMode(m)
    setStep('details')
    setPin('')
    setConfirmPin('')
    setError(null)
  }

  const pinTitle =
    mode === 'signin'
      ? 'Enter your PIN'
      : step === 'pin'
      ? 'Set a 4-digit PIN'
      : 'Confirm your PIN'

  const pinSubtitle =
    mode === 'signin'
      ? 'Enter the 4-digit PIN you chose during registration.'
      : step === 'pin'
      ? "You'll use this PIN every time you sign in."
      : 'Re-enter the same PIN to confirm.'

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 flex flex-col w-full max-w-xl mx-auto pt-safe pb-safe px-margin bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-10">
        <BackButton
          onBack={() => {
            if (step === 'pin') { setStep('details'); setPin(''); setError(null) }
            else if (step === 'confirm') { setStep('pin'); setConfirmPin(''); setError(null) }
            else navigate('/')
          }}
        />

        {/* ── Header ── */}
        <div className="flex flex-col pt-1 pb-5">
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary tracking-tight mb-1">
            {role === 'organizer' ? 'Organizer Sign In' : 'Kuri Ledger'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {step === 'details'
              ? 'Sign in or create your account.'
              : pinSubtitle}
          </p>
        </div>

        {/* ── Mode tabs (details step only) ── */}
        {step === 'details' && (
          <div className="flex bg-surface-container rounded-xl p-1 mb-5">
            {['signin', 'register'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 h-10 rounded-lg font-label-lg text-label-lg font-bold transition-all ${
                  mode === m
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'New Account'}
              </button>
            ))}
          </div>
        )}

        {/* ── Step: Details ── */}
        {step === 'details' && (
          <form onSubmit={handleDetailsNext} className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container" />

              {/* Phone number */}
              <div>
                <label
                  htmlFor="phone-input"
                  className="font-label-lg text-label-lg text-primary font-bold block mb-2"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body-lg text-body-lg text-on-surface-variant select-none">
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    aria-label="Mobile number"
                    className="w-full h-14 pl-12 pr-4 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Name — register only */}
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="name-input"
                    className="font-label-lg text-label-lg text-primary font-bold block mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    aria-label="Your name"
                    className="w-full h-14 px-4 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
                    placeholder="e.g. Sunita Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && <p className="font-label-md text-label-md text-error">{error}</p>}
            </div>

            <Button
              type="submit"
              icon={<Icon name="arrow_forward" className="text-lg" />}
            >
              Continue
            </Button>
          </form>
        )}

        {/* ── Step: PIN / Confirm ── */}
        {(step === 'pin' || step === 'confirm') && (
          <div className="flex flex-col items-center">
            {/* Step chip */}
            {mode === 'register' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high mb-5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  {step === 'pin' ? 'Step 2 of 3' : 'Step 3 of 3'}
                </span>
              </div>
            )}

            <h2 className="font-headline-lg text-headline-lg text-primary mb-1 text-center">
              {pinTitle}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mb-8 max-w-xs">
              {pinSubtitle}
            </p>

            {/* PIN dots */}
            <div className="flex gap-5 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <PinDot key={i} filled={i < activePin().length} />
              ))}
            </div>

            {error && (
              <p className="font-label-md text-label-md text-error mb-4 text-center">{error}</p>
            )}

            {loading && (
              <p className="font-label-md text-label-md text-secondary mb-4">
                {mode === 'register' ? 'Creating account…' : 'Signing in…'}
              </p>
            )}

            {/* Number pad */}
            <div className="w-full grid grid-cols-3 gap-3 mb-2">
              {['1','2','3','4','5','6','7','8','9'].map((d) => (
                <NumKey key={d} label={d} onClick={() => pressDigit(d)} />
              ))}
              <div /> {/* empty cell */}
              <NumKey label="0" onClick={() => pressDigit('0')} />
              <button
                type="button"
                onClick={handleDelete}
                className="h-16 rounded-2xl flex items-center justify-center bg-surface-container-high active:scale-95 transition-all"
              >
                <Icon name="backspace" className="text-on-surface-variant text-2xl" />
              </button>
            </div>
          </div>
        )}

        {/* ── Security note ── */}
        {step === 'details' && (
          <div className="rounded-xl bg-surface-container p-4 flex items-start gap-3.5 mt-5">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
              <Icon name="lock" className="text-lg" />
            </div>
            <div>
              <span className="font-label-lg text-label-lg text-primary font-bold block mb-0.5">
                No passwords, no OTP
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
                Just your mobile number and a 4-digit PIN you create. Simple and secure.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function BackButton({ onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Back"
      className="w-11 h-11 -ml-2 mt-2 rounded-full flex items-center justify-center text-primary active:bg-surface-container-high transition-colors self-start"
    >
      <Icon name="arrow_back_ios_new" className="text-2xl" />
    </button>
  )
}
