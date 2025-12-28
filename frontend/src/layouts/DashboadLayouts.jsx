import Sidebar from '@/components/Sidebar'
import React from 'react'
import { Outlet } from 'react-router-dom'

export default function DashboadLayouts() {
  return (
    <div className='flex min-h-screen'>
        <Sidebar/>

        <main className='ml-64 flex-1 bg-[#f7f7f7] p-6'>
            <Outlet/>
        </main>
    </div>
  )
}
