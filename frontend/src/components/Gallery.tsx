import { useState } from 'react'
import './Gallery.css'

export default function Gallery() {
  // Placeholder images - in production these would come from backend
  const [images] = useState([
    { id: 1, title: 'Orchard View', category: 'orchard', alt: 'Beautiful view of our apple orchard' },
    { id: 2, title: 'Fresh Apples', category: 'apples', alt: 'Freshly picked apples' },
    { id: 3, title: 'Harvest Time', category: 'harvest', alt: 'Apples being harvested' },
    { id: 4, title: 'Sunset at Orchard', category: 'orchard', alt: 'Sunset over the orchard' },
    { id: 5, title: 'Apple Varieties', category: 'apples', alt: 'Different varieties of apples' },
    { id: 6, title: 'Family Tradition', category: 'harvest', alt: 'Our family harvesting apples' },
  ])

  return (
    <section className="gallery">
      <div className="container">
        <h2>Photo Gallery</h2>
        <p className="gallery-intro">
          Take a look at our beautiful orchard and fresh apples
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
          More photos coming soon as we update our gallery with latest harvest images!
        </p>
      </div>
    </section>
  )
}
