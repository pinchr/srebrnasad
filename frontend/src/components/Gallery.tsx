import { useState } from 'react'
import './Gallery.css'

export default function Gallery() {
  // Placeholder images - in production these would come from backend
  const [images] = useState([
    { id: 1, title: 'Widok Sadu', category: 'orchard', alt: 'Piękny widok na nasz sad jabłkowy' },
    { id: 2, title: 'Świeże Jabłka', category: 'apples', alt: 'Świeżo zebrane jabłka' },
    { id: 3, title: 'Czas Zbioru', category: 'harvest', alt: 'Zbieranie jabłek' },
    { id: 4, title: 'Zachód w Sadzie', category: 'orchard', alt: 'Zachód słońca nad sadem' },
    { id: 5, title: 'Odmiany Jabłek', category: 'apples', alt: 'Różne odmiany jabłek' },
    { id: 6, title: 'Tradycja Rodzinna', category: 'harvest', alt: 'Nasza rodzina zbierająca jabłka' },
  ])

  return (
    <section className="gallery">
      <div className="container">
        <h2>Galeria Zdjęć</h2>
        <p className="gallery-intro">
          Spójrz na nasz piękny sad i świeże jabłka
        </p>
        <div className="gallery-grid">
          {images.map((image) => (
            <div key={image.id} className="gallery-item">
              <div className="image-placeholder">
                <span>🍎</span>
              </div>
              <h3>{image.title}</h3>
              <p>{image.alt}</p>
            </div>
          ))}
        </div>
        <p className="gallery-note">
          Więcej zdjęć wkrótce! Aktualizujemy galerię o najnowsze zdjęcia ze zbioru.
        </p>
      </div>
    </section>
  )
}
