import React, { createContext, useState, useContext } from 'react'

interface AdminContextType {
  isEditMode: boolean
  setIsEditMode: (mode: boolean) => void
  isAdminLoggedIn: boolean
  setIsAdminLoggedIn: (logged: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true) // TODO: proper auth

  return (
    <AdminContext.Provider value={{ isEditMode, setIsEditMode, isAdminLoggedIn, setIsAdminLoggedIn }}>
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
