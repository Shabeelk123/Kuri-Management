import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * Lands here after Google OAuth redirects back. supabase-js auto-detects the
 * session from the URL (detectSessionInUrl defaults to true), so by the time
 * `loading` clears, `user` should already be populated via AuthContext's
 * onAuthStateChange listener.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') === 'organizer' ? 'organizer' : 'member'
  const [error, setError] = useState(null)
  const handled = useRef(false)

  useEffect(() => {
    if (loading || handled.current) return

    if (!user) {
      setError('Sign-in did not complete. Please try again.')
      return
    }

    handled.current = true

    async function finish() {
      if (role === 'organizer') {
        const { data: existingOrganizer } = await supabase
          .from('organizers')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existingOrganizer) {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email
          await supabase.from('organizers').upsert({ id: user.id, email: user.email, name })
        }
        navigate('/organizer', { replace: true })
      } else {
        navigate('/member/kuris', { replace: true })
      }
    }

    finish()
  }, [user, loading, role, navigate])

  return (
    <main className="flex-1 flex flex-col items-center justify-center w-full min-h-screen bg-surface px-margin text-center">
      {error ? (
        <>
          <p className="font-body-md text-body-md text-error mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-label-lg text-label-lg text-primary font-bold"
          >
            Back to sign in
          </button>
        </>
      ) : (
        <p className="font-body-md text-body-md text-on-surface-variant">Signing you in…</p>
      )}
    </main>
  )
}
