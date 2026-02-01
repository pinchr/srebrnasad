import './Footer.css'

interface FooterProps {
  setCurrentPage?: (page: 'home' | 'gallery' | 'contact' | 'order' | 'admin') => void
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const handleLinkClick = (page: 'home' | 'gallery' | 'contact' | 'order' | 'admin') => {
    if (setCurrentPage) {
      setCurrentPage(page)
      window.scrollTo(0, 0)
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Srebrna 15</h4>
            <p>Świeże jabłka z naszego rodzinnego sadu w Srebrnej, Polska</p>
          </div>
          <div className="footer-section">
            <h4>Szybkie Linki</h4>
            <ul>
              <li><button onClick={() => handleLinkClick('order')} className="footer-link">Zamów</button></li>
              <li><button onClick={() => handleLinkClick('gallery')} className="footer-link">Galeria</button></li>
              <li><button onClick={() => handleLinkClick('contact')} className="footer-link">Kontakt</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Kontakt</h4>
            <p>Srebrna 15, 09-162 Nacpolsk, Polska</p>
            <p>+48 509 518 545</p>
            <p>info@srebrnasad.pl</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} CzyzSoft. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}
