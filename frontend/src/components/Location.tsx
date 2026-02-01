import './Location.css'

export default function Location() {
  return (
    <section className="location">
      <div className="container">
        <h2>📍 Gdzie nas znaleźć</h2>
        <p className="location-intro">
          Zapraszamy do naszego sadu w Nacpolsku. Możesz nas odwiedzić, aby wybrać świeże jabłka lub umówić się na odbiór zamówienia.
        </p>
        
        <div className="location-content">
          <div className="location-info">
            <div className="info-item">
              <h3>Adres</h3>
              <p>Srebrna 15<br />09-162 Nacpolsk, Polska</p>
            </div>
            
            <div className="info-item">
              <h3>Godziny otwarcia</h3>
              <p>
                Poniedziałek - Piątek: 8:00 - 18:00<br />
                Sobota: 9:00 - 17:00<br />
                Niedziela: Zamknięte
              </p>
            </div>
            
            <div className="info-item">
              <h3>Kontakt</h3>
              <p>
                Email: <a href="mailto:info@srebrnasad.pl">info@srebrnasad.pl</a><br />
                Telefon: <a href="tel:+48793203605">+48 793 203 605</a>
              </p>
            </div>
          </div>
          
          <div className="map-container">
            <iframe
              title="Srebrna 15, Nacpolsk"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '8px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.8574842344573!2d20.838779!3d52.31382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471eb88d8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sSrebrna%2015%2C%2009-162%20Nacpolsk!5e0!3m2!1spl!2spl!4v1706795000000"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
