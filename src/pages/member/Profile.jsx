import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import Card from '../../components/Card'
import Button from '../../components/Button'
import BottomNav from '../../components/BottomNav'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      <TopBar title="Profile" />
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-header-safe pb-28 px-margin bg-surface min-h-screen">
        <div className="flex flex-col w-full space-y-4 pt-1">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
              <Icon name="person" className="text-3xl text-on-primary" />
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Member</h1>
          </div>

          <Card>
            <div className="flex flex-col divide-y divide-surface-container">
              <div className="py-3 flex items-center gap-3">
                <Icon name="call" className="text-on-surface-variant text-[20px]" />
                <div>
                  <span className="font-label-md text-label-md text-on-surface-variant block">Phone</span>
                  <span className="font-body-lg text-body-lg text-on-surface">
                    {user?.phone ? `+${user.phone}` : '—'}
                  </span>
                </div>
              </div>
              <div className="py-3 flex items-center gap-3">
                <Icon name="mail" className="text-on-surface-variant text-[20px]" />
                <div>
                  <span className="font-label-md text-label-md text-on-surface-variant block">Email</span>
                  <span className="font-body-lg text-body-lg text-on-surface">{user?.email ?? '—'}</span>
                </div>
              </div>
            </div>
          </Card>

          <Button variant="secondary" onClick={handleSignOut} icon={<Icon name="logout" className="text-[18px]" />}>
            Sign out
          </Button>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
