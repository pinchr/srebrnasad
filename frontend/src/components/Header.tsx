import './Header.css'

interface HeaderProps {
  currentPage: 'home' | 'gallery' | 'contact'
  setCurrentPage: (page: 'home' | 'gallery' | 'contact') => void
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <h1>🍎 Srebrna Sad</h1>
          <p className="subtitle">Orchard in Naruszewo</p>
        </div>
        <nav className="nav">
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${currentPage === 'gallery' ? 'active' : ''}`}
            onClick={() => setCurrentPage('gallery')}
          >
            Gallery
          </button>
          <button 
            className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
            onClick={() => setCurrentPage('contact')}
          >
            Contact
          </button>
        </nav>
      </div>
    </header>
  )
}
