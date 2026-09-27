import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import RequireAuth from './components/RequireAuth'
import RoleChoice from './pages/RoleChoice'

const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Dashboard = lazy(() => import('./pages/organizer/Dashboard'))
const CreateKuri = lazy(() => import('./pages/organizer/CreateKuri'))
const OrganizerKuriDetail = lazy(() => import('./pages/organizer/KuriDetail'))
const OrganizerProfile = lazy(() => import('./pages/organizer/Profile'))
const OrganizerWelcome = lazy(() => import('./pages/organizer/Welcome'))
const Login = lazy(() => import('./pages/member/Login'))
const VerifyOtp = lazy(() => import('./pages/member/VerifyOtp'))
const Invitations = lazy(() => import('./pages/member/Invitations'))
const MyKuris = lazy(() => import('./pages/member/MyKuris'))
const MemberKuriDetail = lazy(() => import('./pages/member/KuriDetail'))
const Updates = lazy(() => import('./pages/member/Updates'))
const MemberProfile = lazy(() => import('./pages/member/Profile'))

function RouteFallback() {
  return (
    <main className="flex-1 flex items-center justify-center w-full min-h-screen bg-surface">
      <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<RoleChoice />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route path="/organizer/login" element={<Login role="organizer" />} />
            <Route path="/organizer/verify" element={<VerifyOtp role="organizer" />} />
            <Route
              path="/organizer/welcome"
              element={
                <RequireAuth redirectTo="/organizer/login">
                  <OrganizerWelcome />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer"
              element={
                <RequireAuth redirectTo="/organizer/login">
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer/new"
              element={
                <RequireAuth redirectTo="/organizer/login">
                  <CreateKuri />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer/kuri/:kuriId"
              element={
                <RequireAuth redirectTo="/organizer/login">
                  <OrganizerKuriDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer/profile"
              element={
                <RequireAuth redirectTo="/organizer/login">
                  <OrganizerProfile />
                </RequireAuth>
              }
            />

            <Route path="/member/login" element={<Login role="member" />} />
            <Route path="/member/verify" element={<VerifyOtp role="member" />} />
            <Route
              path="/member/invitations"
              element={
                <RequireAuth redirectTo="/member/login">
                  <Invitations />
                </RequireAuth>
              }
            />
            <Route
              path="/member/kuris"
              element={
                <RequireAuth redirectTo="/member/login">
                  <MyKuris />
                </RequireAuth>
              }
            />
            <Route
              path="/member/kuri/:memberId"
              element={
                <RequireAuth redirectTo="/member/login">
                  <MemberKuriDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/member/updates"
              element={
                <RequireAuth redirectTo="/member/login">
                  <Updates />
                </RequireAuth>
              }
            />
            <Route
              path="/member/profile"
              element={
                <RequireAuth redirectTo="/member/login">
                  <MemberProfile />
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
