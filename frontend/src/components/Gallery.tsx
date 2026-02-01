import { useState, useEffect } from 'react'
import apiClient from '../axiosConfig'
import { useAdmin } from '../AdminContext'
import './Gallery.css'

interface GalleryImage {
  id: string
  title: string
  description: string
  photo_url?: string
  category: string
}

export default function Gallery() {
  const { isAdminLoggedIn } = useAdmin()
  const [isEditMode, setIsEditMode] = useState(false)
  const [images, setImages] = useState<GalleryImage[]>([
    { id: '1', title: 'Widok Sadu', category: 'orchard', description: 'Piękny widok na nasz sad jabłkowy', photo_url: '🍎' },
    { id: '2', title: 'Świeże Jabłka', category: 'apples', description: 'Świeżo zebrane jabłka', photo_url: '🍎' },
    { id: '3', title: 'Czas Zbioru', category: 'harvest', description: 'Zbieranie jabłek', photo_url: '🍎' },
    { id: '4', title: 'Zachód w Sadzie', category: 'orchard', description: 'Zachód słońca nad sadem', photo_url: '🍎' },
    { id: '5', title: 'Odmiany Jabłek', category: 'apples', description: 'Różne odmiany jabłek', photo_url: '🍎' },
    { id: '6', title: 'Tradycja Rodzinna', category: 'harvest', description: 'Nasza rodzina zbierająca jabłka', photo_url: '🍎' },
  ])
  const [message, setMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await apiClient.get('/content/gallery')
        if (response.data.images && response.data.images.length > 0) {
          setImages(response.data.images)
        }
      } catch (err) {
        console.error('Error loading gallery:', err)
      }
    }
    
    loadGallery()
  }, [])

  const handleImageChange = async (id: string, file: File) => {
    setUploadingImage(id)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      console.log('Uploading file:', { name: file.name, size: file.size, type: file.type })
      
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      console.log('Upload response:', response.data)
      
      setImages(images.map(img => 
        img.id === id ? { ...img, photo_url: response.data.url } : img
      ))
      setMessage('✓ Zdjęcie wgrane')
      setTimeout(() => setMessage(''), 2000)
    } catch (err: any) {
      let errorMsg = '✗ Błąd przy wgrywaniu'
      if (err.response?.data?.detail) {
        errorMsg = `✗ ${err.response.data.detail}`
      } else if (err.message) {
        errorMsg = `✗ ${err.message}`
      }
      setMessage(errorMsg)
      console.error('Upload error:', {
        status: err.response?.status,
        detail: err.response?.data?.detail,
        message: err.message,
        file: file.name,
        size: file.size,
        type: file.type
      })
    } finally {
      setUploadingImage(null)
    }
  }

  const updateImage = (id: string, field: string, value: string) => {
    setImages(images.map(img =>
      img.id === id ? { ...img, [field]: value } : img
    ))
  }

  const saveGallery = async () => {
    try {
      setMessage('Zapisywanie...')
      await apiClient.post('/content/gallery', { images })
      setIsEditMode(false)
      setMessage('✓ Galeria zapisana')
      setTimeout(() => setMessage(''), 2000)
      
      // Reload gallery data to ensure we're showing saved content
      const response = await apiClient.get('/content/gallery')
      if (response.data.images && response.data.images.length > 0) {
        setImages(response.data.images)
      }
    } catch (err) {
      setMessage('✗ Błąd przy zapisywaniu')
      console.error(err)
    }
  }

  if (isEditMode) {
    return (
      <section className="gallery-edit">
        <div className="gallery-edit-container">
          <h3>Edytuj Galerię</h3>
          {message && <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>{message}</div>}

          <div className="gallery-edit-grid">
            {images.map((image) => (
              <div key={image.id} className="gallery-edit-item">
                <div className="image-editor">
                  <label>Zdjęcie</label>
                  <div className="image-preview">
                    {image.photo_url?.startsWith('http') || image.photo_url?.startsWith('/') ? (
                      <img src={image.photo_url} alt={image.title} />
                    ) : (
                      <span className="image-placeholder">{image.photo_url || '📸'}</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageChange(image.id, e.target.files[0])}
                    disabled={uploadingImage === image.id}
                  />
                  {uploadingImage === image.id && <p className="uploading">Wgrywanie...</p>}
                </div>

                <div className="text-editor">
                  <label>Tytuł</label>
                  <input
                    type="text"
                    value={image.title}
                    onChange={(e) => updateImage(image.id, 'title', e.target.value)}
                  />

                  <label>Opis</label>
                  <textarea
                    value={image.description}
                    onChange={(e) => updateImage(image.id, 'description', e.target.value)}
                    rows={2}
                  />

                  <label>Kategoria</label>
                  <select
                    value={image.category}
                    onChange={(e) => updateImage(image.id, 'category', e.target.value)}
                  >
                    <option value="orchard">Sad</option>
                    <option value="apples">Jabłka</option>
                    <option value="harvest">Zbiór</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="gallery-edit-actions">
            <button className="save-btn" onClick={saveGallery}>💾 Zapisz Galerię</button>
            <button className="cancel-btn" onClick={() => setIsEditMode(false)}>✕ Anuluj</button>
          </div>
        </div>
      </section>
    )
  }

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
              <div className="image-placeholder-container">
                {image.photo_url?.startsWith('http') || image.photo_url?.startsWith('/') ? (
                  <img src={image.photo_url} alt={image.title} />
                ) : (
                  <span className="image-placeholder">{image.photo_url || '📸'}</span>
                )}
              </div>
              <h3>{image.title}</h3>
              <p>{image.description}</p>
            </div>
          ))}
        </div>
        <p className="gallery-note">
          Więcej zdjęć wkrótce! Aktualizujemy galerię o najnowsze zdjęcia ze zbioru.
        </p>
      </div>

      {isAdminLoggedIn && (
        <button className="edit-btn" onClick={() => setIsEditMode(true)} title="Edytuj galerię">
          🔨
        </button>
      )}
    </section>
  )
}
