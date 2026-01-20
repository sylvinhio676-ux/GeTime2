import Sidebar from '@/components/Sidebar'
import NotificationBell from '@/components/NotificationBell'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Home, Settings, Moon, Sun } from 'lucide-react'

export default function DashboadLayouts() {
  const [theme, setTheme] = useState('light')
  const isDark = theme === 'dark'

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const initial = storedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

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

        <div className='ml-0 lg:ml-64 flex-1 bg-background min-h-screen'>
            <header className='sticky top-0 z-40 flex items-center justify-between gap-3 bg-card/90 backdrop-blur border-b border-border px-4 md:px-6 py-3'>
              <div className='flex gap-3 items-center'>
                <Link to='/' className='inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold uppercase tracking-wide'>
                  <Home className='w-4 h-4' /> Accueil
                </Link>
                <Link to='/dashboard/settings' className='inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold uppercase tracking-wide'>
                  <Settings className='w-4 h-4' /> Paramètres
                </Link>
              </div>

              <div className='flex items-center gap-3'>
                <button
                  onClick={toggleTheme}
                  className='flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold uppercase tracking-wide'
                >
                  {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
                  {isDark ? 'Clair' : 'Sombre'}
                </button>
                <NotificationBell />
              </div>
            </header>
            <main className='p-4 md:p-6'>
              <Outlet/>
            </main>
        </div>
    </div>
  )
}
