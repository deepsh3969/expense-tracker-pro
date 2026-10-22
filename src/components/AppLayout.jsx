import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { useApp } from '../context/AppContext'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { profile, toasts, dismissToast, confirmState, handleConfirm } = useApp()

  return (
    <div className="app-layout">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        studentName={profile.name}
      />
      <div className="app-main">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialog state={confirmState} onAnswer={handleConfirm} />
    </div>
  )
}
