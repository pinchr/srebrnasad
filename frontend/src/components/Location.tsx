import './Location.css'

export default function Location() {
  return (
    <section className="location">
      <div className="container">
        <h2>📍 Gdzie nas znaleźć</h2>
        <p className="location-intro">
          Zapraszamy do naszego sadu w Srebrnej. Możesz nas odwiedzić, aby wybrać świeże jabłka lub umówić się na odbiór zamówienia.
        </p>
        
        <div className="location-content">
          <div className="location-info">
            <div className="info-item">
              <h4>Adres</h4>
              <p>Srebrna 15<br />09-162 Nacpolsk, Polska</p>
              
              <h4><br />Godziny otwarcia</h4>
              <p>
                Poniedziałek - Piątek: 8:00 - 18:00<br />
                Sobota: 9:00 - 17:00<br />
                Niedziela: Zamknięte
              </p>

              <h4><br />Kontakt</h4>
              <p>
                Email: <a href="mailto:info@srebrnasad.pl">info@srebrnasad.pl</a><br />
                Telefon: <a href="tel:+48509518545">+48 509 518 545</a>
              </p>
            </div>
          </div>
          
          <div className="map-container">
            <iframe
              title="Srebrna 15, Nacpolsk - Gospodarstwo Sądownicze Janusz Czyż"
              width="100%"
              height="390"
              style={{ border: 0, borderRadius: '8px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2442.6748!2d20.32534254089926!3d52.49112601595363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471e9a5d9a5d9a5d%3A0x8b8b8b8b8b8b8b8b!2sSrebrna%2015%2C%2009-152%20Naruszewo!5e0!3m2!1spl!2spl!4v1738441200000&q=52.49112601595363,20.32534254089926"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
