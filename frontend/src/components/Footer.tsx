import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Srebrna Sad</h4>
            <p>Fresh apples from our family orchard in Naruszewo, Poland</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Srebrna, Naruszewo, Poland</p>
            <p>+48 XXX XXX XXX</p>
            <p>info@srebrnasad.pl</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Srebrna Sad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
