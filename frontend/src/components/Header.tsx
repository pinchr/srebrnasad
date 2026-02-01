import { useAdmin } from '../AdminContext'
import LoginPanel from './LoginPanel'
import './Header.css'

interface HeaderProps {
  currentPage: 'home' | 'gallery' | 'contact' | 'order' | 'admin'
  setCurrentPage: (page: 'home' | 'gallery' | 'contact' | 'order' | 'admin') => void
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const { isAdminLoggedIn } = useAdmin()
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <h1>🍎 Srebrna 15</h1>
          <p className="subtitle">Sad Jabłoniowy w Srebrnej</p>
        </div>
        <nav className="nav">
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Strona główna
          </button>
          <button 
            className={`nav-link ${currentPage === 'gallery' ? 'active' : ''}`}
            onClick={() => setCurrentPage('gallery')}
          >
            Galeria
          </button>
          <button 
            className={`nav-link ${currentPage === 'order' ? 'active' : ''}`}
            onClick={() => setCurrentPage('order')}
          >
            Zamów
          </button>
          <button 
            className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
            onClick={() => setCurrentPage('contact')}
          >
            Kontakt
          </button>
          
          {isAdminLoggedIn && (
            <button 
              className={`nav-link admin-link ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentPage('admin')}
              title="Panel administracyjny"
            >
              ⚙️
            </button>
          )}
          
          <div className="nav-spacer"></div>
          <LoginPanel />
        </nav>
      </div>
    </header>
  )
}
