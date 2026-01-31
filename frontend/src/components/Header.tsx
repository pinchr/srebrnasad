import './Header.css'

interface HeaderProps {
  currentPage: 'home' | 'gallery' | 'contact' | 'order'
  setCurrentPage: (page: 'home' | 'gallery' | 'contact' | 'order') => void
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <h1>🍎 Srebrna Sad</h1>
          <p className="subtitle">Sad w Srebrnej</p>
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
        </nav>
      </div>
    </header>
  )
}
