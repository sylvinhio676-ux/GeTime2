import React, { useEffect } from 'react'
import AppRouter from './router/AppRouter'
import { fixLeafletIcons } from './lib/leafletIcons'

export default function App() {
  useEffect(() => {
    fixLeafletIcons();
  }, []);
  return (
    <>
      <AppRouter/>
    </>
  )
}
