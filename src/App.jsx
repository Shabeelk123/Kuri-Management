import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import RequireAuth from './components/RequireAuth'
import RoleChoice from './pages/RoleChoice'
import Dashboard from './pages/organizer/Dashboard'
import CreateKuri from './pages/organizer/CreateKuri'
import OrganizerKuriDetail from './pages/organizer/KuriDetail'
import OrganizerProfile from './pages/organizer/Profile'
import Login from './pages/member/Login'
import VerifyOtp from './pages/member/VerifyOtp'
import Invitations from './pages/member/Invitations'
import MyKuris from './pages/member/MyKuris'
import MemberKuriDetail from './pages/member/KuriDetail'
import Updates from './pages/member/Updates'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleChoice />} />

          <Route path="/organizer/login" element={<Login role="organizer" />} />
          <Route path="/organizer/verify" element={<VerifyOtp role="organizer" />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
