import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAuthFromStorage } from './services/auth'

// Initialize axios Authorization header from localStorage token (if present)
initAuthFromStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
