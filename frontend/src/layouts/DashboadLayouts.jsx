import Sidebar from '@/components/Sidebar'
import NotificationBell from '@/components/NotificationBell'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Home, Settings, Moon, Sun, BarChart3 } from 'lucide-react'

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
                  <NotificationBell />
                </div>
              </div>
            </header>
            <main className='p-4 md:p-6'>
              <Outlet/>
            </main>
        </div>
    </div>
  )
}
