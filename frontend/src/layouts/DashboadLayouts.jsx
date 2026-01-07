import Sidebar from '@/components/Sidebar'
import NotificationBell from '@/components/NotificationBell'
import React from 'react'
import { Outlet } from 'react-router-dom'

export default function DashboadLayouts() {
  return (
    <div className='flex min-h-screen'>
        <Sidebar/>

        <div className='ml-0 lg:ml-64 flex-1 bg-[#f8fafc] min-h-screen'>
            <header className='sticky top-0 z-40 flex items-center justify-end gap-3 bg-white/90 backdrop-blur border-b border-slate-200 px-4 md:px-6 py-3'>
              <NotificationBell />
            </header>
            <main className='p-4 md:p-6'>
              <Outlet/>
            </main>
        </div>
    </div>
  )
}
