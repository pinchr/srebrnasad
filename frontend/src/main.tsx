import React from 'react'
import ReactDOM from 'react-dom/client'
import { AdminProvider } from './AdminContext'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminProvider>
      <App />
    </AdminProvider>
  </React.StrictMode>,
)
