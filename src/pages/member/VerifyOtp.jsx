import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import Button from '../../components/Button'
import { supabase } from '../../lib/supabase'
import { toE164 } from '../../lib/phone'

export default function VerifyOtp({ role = 'member' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone ?? ''
  const effectiveRole = location.state?.role ?? role
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)

  async function handleVerify(e) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured yet — see docs/01-SETUP.md.')
      return
    }
    setVerifying(true)
    setError(null)
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: toE164(phone),
      token: code,
      type: 'sms',
    })
    if (verifyError) {
      setVerifying(false)
      setError(verifyError.message)
      return
    }

    if (effectiveRole === 'organizer' && data.user) {
      const { error: profileError } = await supabase
        .from('organizers')
        .upsert({ id: data.user.id, phone: data.user.phone, name: data.user.phone })
      if (profileError) {
        setVerifying(false)
        setError(profileError.message)
        return
      }
    }

    setVerifying(false)
    navigate(effectiveRole === 'organizer' ? '/organizer' : '/member/kuris')
  }

  return (
    <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-safe pb-safe px-margin bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-8">
        <div className="flex flex-col pt-8 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high w-fit mb-3">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Step 2 of 2: Verification
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Enter the code
          </h1>
        </div>

        <form
          onSubmit={handleVerify}
          className="bg-surface-container-lowest rounded-xl p-5 shadow-sm mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <h2 className="font-headline-md text-headline-md text-primary">Enter 4-Digit Code</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
              SMS SENT
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            Sent to <span className="font-bold text-on-surface">+91 {phone}</span>. Check your
            messages.
          </p>
          <input
            aria-label="Verification code"
            className="w-full h-16 mb-4 text-center rounded-lg bg-surface-container-low shadow-inner font-numeric-hero-mobile text-numeric-hero-mobile text-primary font-extrabold tracking-[0.5em] focus:outline-none"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="0000"
            required
          />
          {error && <p className="font-label-md text-label-md text-error mb-3">{error}</p>}
          <Button type="submit" disabled={verifying || code.length !== 4}>
            {verifying ? 'Verifying…' : 'Verify & Continue'}
          </Button>
        </form>

        <div className="rounded-xl bg-surface-container p-4 flex items-start gap-3.5">
          <Icon name="lock" className="text-primary text-lg mt-0.5" />
          <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
            No passwords to remember — this code is all you need to sign in.
          </p>
        </div>
      </div>
    </main>
  )
}
