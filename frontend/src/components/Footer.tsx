import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Srebrna Sad</h4>
            <p>Świeże jabłka z naszego rodzinnego sadu w Naruszewo, Polska</p>
          </div>
          <div className="footer-section">
            <h4>Szybkie Linki</h4>
            <ul>
              <li><a href="#home">Strona główna</a></li>
              <li><a href="#gallery">Galeria</a></li>
              <li><a href="#contact">Kontakt</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Kontakt</h4>
            <p>Srebrna 15, Naruszewo, Polska</p>
            <p>+48 XXX XXX XXX</p>
            <p>info@srebrnasad.pl</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} CzyzbySoft. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}
