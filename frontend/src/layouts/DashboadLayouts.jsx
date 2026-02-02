import Sidebar from '@/components/Sidebar'
import NotificationBell from '@/components/NotificationBell'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Home, Settings, Moon, Sun, BarChart3 } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { registerPushToken } from '@/services/firebase/push'

const NOTIF_FLAG = (userId) => `notifications-enabled-${userId ?? 'guest'}`
const NOTIF_PROMPT_KEY = (userId) => `notifications-prompted-${userId ?? 'guest'}`

export default function DashboadLayouts() {
  const { user } = useAuth()
  const [theme, setTheme] = useState('light')
  const isDark = theme === 'dark'
  const [notificationStatus, setNotificationStatus] = useState('idle')
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const initial = storedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const handleEnableNotifications = async () => {
    if (notificationStatus !== 'idle') return
    setNotificationStatus('pending')
    try {
      await registerPushToken()
      if (user?.id) {
        localStorage.setItem(NOTIF_FLAG(user.id), 'true')
        localStorage.setItem(NOTIF_PROMPT_KEY(user.id), 'true')
      }
      setNotificationStatus('enabled')
      setShowPrompt(false)
    } catch {
      if (user?.id) {
        localStorage.setItem(NOTIF_FLAG(user.id), 'false')
      }
      setNotificationStatus('idle')
    }
  }

  const handleDeclineNotifications = () => {
    if (user?.id) {
      localStorage.setItem(NOTIF_PROMPT_KEY(user.id), 'true')
    }
    setShowPrompt(false)
  }

  useEffect(() => {
    if (!user) {
      setShowPrompt(false)
      return
    }
    const alreadyPrompted = user?.id ? localStorage.getItem(NOTIF_PROMPT_KEY(user.id)) === 'true' : false
    const enabledFlag = user?.id ? localStorage.getItem(NOTIF_FLAG(user.id)) === 'true' : false
    if (notificationStatus === 'idle') {
      setNotificationStatus(enabledFlag ? 'enabled' : 'idle')
    }
    if (!enabledFlag && !alreadyPrompted) {
      setShowPrompt(true)
    }
  }, [user, notificationStatus])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }

  return (
    <div className='flex min-h-screen'>
        <Sidebar/>

        <div className='ml-0 lg:ml-64 flex-1 bg-background min-h-screen flex flex-col'>
            <header className='sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border px-4 md:px-6 py-3 shadow-sm'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                <div className='flex flex-wrap gap-2 items-center overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/50'>
                  {[['/', 'Accueil'], ['/dashboard/settings', 'Paramètres'], ['/dashboard/quota-dashboard', 'Quotas']].map(([href, label]) => (
                    <Link
                      key={href}
                      to={href}
                      className='inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold uppercase tracking-wide min-w-[90px]'
                    >
                      {href === '/' && <Home className='w-4 h-4' />}
                      {href === '/dashboard/settings' && <Settings className='w-4 h-4' />}
                      {href === '/dashboard/quota-dashboard' && <BarChart3 className='w-4 h-4' />}
                      {label}
                    </Link>
                  ))}
                </div>
                <div className='flex flex-wrap gap-3 items-center justify-end'>
                  <button
                    onClick={toggleTheme}
                    className='flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold uppercase tracking-wide min-w-[90px]'
                  >
                    {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
                    {isDark ? 'Clair' : 'Sombre'}
                  </button>
                  <button
                    onClick={handleEnableNotifications}
                    disabled={notificationStatus !== 'idle'}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide min-w-[90px] ${
                      notificationStatus === 'enabled'
                        ? 'bg-success text-success-foreground cursor-default'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {notificationStatus === 'pending' && 'Activation...'}
                    {notificationStatus === 'enabled' && 'Notifications actives'}
                    {notificationStatus === 'idle' && 'Activer les notifications'}
                  </button>
                  <NotificationBell />
                </div>
              </div>
            </header>
            <main className='p-4 md:p-6'>
              <Outlet/>
            </main>
        </div>
        {showPrompt && (
          <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60'>
            <div className='bg-card border border-border rounded-[2rem] shadow-2xl p-6 max-w-sm text-center space-y-4'>
              <h3 className='text-lg font-black text-foreground'>Activer les notifications</h3>
              <p className='text-sm text-muted-foreground'>
                Pour recevoir les alertes en temps réel (créations, suppressions, publications), active les push notifications maintenant.
              </p>
              <div className='flex justify-center gap-3'>
                <button
                  onClick={handleEnableNotifications}
                  className='px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold'
                >
                  Activer
                </button>
                <button
                  onClick={handleDeclineNotifications}
                  className='px-4 py-2 rounded-full bg-muted text-muted-foreground font-semibold border border-border'
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
