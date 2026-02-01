import React, { createContext, useState, useContext, useEffect } from 'react'

interface AdminContextType {
  isEditMode: boolean
  setIsEditMode: (mode: boolean) => void
  isAdminLoggedIn: boolean
  setIsAdminLoggedIn: (logged: boolean) => void
  adminName: string
  setAdminName: (name: string) => void
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminName, setAdminName] = useState('')

  // Check localStorage for existing session
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminSession')
    if (savedAdmin) {
      const admin = JSON.parse(savedAdmin)
      setIsAdminLoggedIn(true)
      setAdminName(admin.name)
    }
  }, [])

  const logout = () => {
    setIsAdminLoggedIn(false)
    setAdminName('')
    localStorage.removeItem('adminSession')
  }

  return (
    <AdminContext.Provider value={{ 
      isEditMode, 
      setIsEditMode, 
      isAdminLoggedIn, 
      setIsAdminLoggedIn,
      adminName,
      setAdminName,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
