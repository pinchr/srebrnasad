import { useState } from 'react'
import { useAdmin } from '../AdminContext'
import './LoginPanel.css'

export default function LoginPanel() {
  const { isAdminLoggedIn, setIsAdminLoggedIn, setAdminName, adminName, logout } = useAdmin()
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simple demo auth - in production use real backend auth
    if (email && password) {
      // Extract name from email or use provided name
      const displayName = name || email.split('@')[0]
      
      const adminData = {
        email,
        name: displayName,
        loginTime: new Date().toISOString()
      }

      localStorage.setItem('adminSession', JSON.stringify(adminData))
      setIsAdminLoggedIn(true)
      setAdminName(displayName)
      setShowLogin(false)
      setEmail('')
      setPassword('')
      setName('')
    } else {
      setError('Wypełnij email i hasło')
    }

    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    setShowLogin(false)
  }

  if (isAdminLoggedIn) {
    return (
      <div className="admin-status">
        <span className="admin-welcome">👤 {adminName}</span>
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title="Wyloguj się"
        >
          🚪 Wyloguj
        </button>
      </div>
    )
  }

  return (
    <>
      {!showLogin ? (
        <button
          className="login-trigger-btn"
          onClick={() => setShowLogin(true)}
          title="Panel logowania administratora"
        >
          🔐 Admin
        </button>
      ) : (
        <div className="login-panel-overlay">
          <div className="login-panel">
            <div className="login-header">
              <h3>Panel Administracyjny</h3>
              <button 
                className="close-btn"
                onClick={() => setShowLogin(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="name">Imię (opcjonalnie)</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Twoje imię"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@srebrnasad.pl"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Hasło *</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? 'Logowanie...' : '🔓 Zaloguj'}
              </button>

              <p className="login-hint">
                Demo: wpisz dowolny email i hasło
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
