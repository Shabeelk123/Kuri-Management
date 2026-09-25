import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import Button from '../../components/Button'
import EmailAuthForm from '../../components/EmailAuthForm'
import { supabase } from '../../lib/supabase'
import { toE164 } from '../../lib/phone'

export default function Login({ role = 'member' }) {
  const [method, setMethod] = useState('phone') // 'phone' | 'email'

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

        <div className="flex items-center bg-surface-container-high p-1 rounded-full w-fit mb-4">
          <button
            type="button"
            onClick={() => setMethod('phone')}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 ${
              method === 'phone' ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            <Icon name="phone_iphone" className="text-[16px]" />
            Phone
          </button>
          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 ${
              method === 'email' ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            <Icon name="mail" className="text-[16px]" />
            Email
          </button>
        </div>

        {method === 'phone' ? <PhoneAuthForm role={role} /> : <EmailAuthForm role={role} />}

        <div className="rounded-xl bg-surface-container p-4 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
            <Icon name="lock" className="text-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg text-primary font-bold mb-0.5">
              Safe &amp; Secure
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
              {method === 'phone'
                ? 'No passwords to remember. Your phone number securely connects you to your family and community savings circles.'
                : 'Your email and password stay private and are never shared with other members.'}
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

function PhoneAuthForm({ role }) {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  async function handleSendCode(e) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured yet — see docs/01-SETUP.md.')
      return
    }
    setSending(true)
    setError(null)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: toE164(phone),
    })
    setSending(false)
    if (otpError) {
      setError(otpError.message)
      return
    }
    navigate(role === 'organizer' ? '/organizer/verify' : '/member/verify', { state: { phone, role } })
  }

  return (
    <form
      onSubmit={handleSendCode}
      className="bg-surface-container-lowest rounded-xl p-5 shadow-sm mb-5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container" />
      <div className="flex items-center justify-between mb-4">
        <label className="font-label-lg text-label-lg text-primary font-bold" htmlFor="phone-input">
          Mobile Phone Number
        </label>
        <Icon name="contactless" className="text-secondary text-xl" />
      </div>
      <div className="relative flex items-center w-full h-14 bg-surface-container-low rounded-lg px-3 mb-3">
        <div className="flex items-center gap-1 pr-3 mr-2 bg-surface-variant/40 py-1.5 px-2.5 rounded-md">
          <span className="font-numeric-sub text-numeric-sub text-primary font-bold">+91</span>
        </div>
        <input
          aria-label="Mobile Phone Number"
          className="w-full bg-transparent font-numeric-sub text-numeric-sub text-primary focus:outline-none tracking-wide"
          id="phone-input"
          inputMode="numeric"
          pattern="[0-9]*"
          type="tel"
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="flex items-start gap-2 mb-5">
        <Icon name="sms" className="text-on-surface-variant text-lg mt-0.5" />
        <p className="font-body-md text-body-md text-on-surface-variant">
          We will send a 4-digit verification code via SMS. No passwords needed.
        </p>
      </div>
      {error && <p className="font-label-md text-label-md text-error mb-3">{error}</p>}
      <Button type="submit" disabled={sending} icon={<Icon name="arrow_forward" className="text-lg" />}>
        {sending ? 'Sending…' : 'Send Verification Code'}
      </Button>
    </form>
  )
}
