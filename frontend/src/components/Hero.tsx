import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAdmin } from '../AdminContext'
import './Hero.css'

interface HeroData {
  title: string
  subtitle: string
  description: string
  background_image?: string
}

export default function Hero() {
  const { isAdminLoggedIn } = useAdmin()
  const [isLocalEditMode, setIsLocalEditMode] = useState(false)
  const [heroData, setHeroData] = useState<HeroData>({
    title: 'Witaj w Srebrnej Sadzie',
    subtitle: 'Świeże jabłka z naszego rodzinnego sadu w Srebrnej, Naruszewo',
    description: 'Uprawiamy wysokiej jakości jabłka metodami tradycyjnymi. Odwiedź nas lub złóż zamówienie, aby poczuć różnicę.',
    background_image: undefined
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  // Load hero data from backend on mount
  useEffect(() => {
    const loadHeroData = async () => {
      try {
        const response = await axios.get('/api/content/hero')
        if (response.data) {
          setHeroData(response.data)
        }
      } catch (err) {
        console.error('Failed to load hero data:', err)
      }
    }
    loadHeroData()
  }, [])

  const toggleEditMode = () => {
    setIsLocalEditMode(!isLocalEditMode)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setHeroData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0])
    }
  }

  const saveChanges = async () => {
    try {
      setMessage('Zapisywanie...')

      let backgroundImage = heroData.background_image
      if (photoFile) {
        const formData = new FormData()
        formData.append('file', photoFile)
        const response = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        backgroundImage = response.data.url
      }

      // Save to backend
      await axios.post('/api/content/hero', {
        ...heroData,
        background_image: backgroundImage
      })

      setHeroData(prev => ({
        ...prev,
        background_image: backgroundImage
      }))
      
      setPhotoFile(null)
      setIsLocalEditMode(false)
      setMessage('✓ Zapisano!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('✗ Błąd przy zapisywaniu')
      console.error(err)
    }
  }

  const cancelEdit = () => {
    setIsLocalEditMode(false)
    setPhotoFile(null)
    setMessage('')
  }

  if (isLocalEditMode) {
    return (
      <section className="hero-edit">
        <div className="hero-edit-form">
          <h3>Edytuj Sekcję Hero</h3>

          {message && <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>{message}</div>}

          <div className="form-group">
            <label>Tytuł</label>
            <input
              type="text"
              name="title"
              value={heroData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Podtytuł</label>
            <input
              type="text"
              name="subtitle"
              value={heroData.subtitle}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Opis</label>
            <textarea
              name="description"
              value={heroData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Zdjęcie tła</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            {photoFile && <p className="file-info">✓ {photoFile.name}</p>}
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={saveChanges}>💾 Zapisz</button>
            <button className="cancel-btn" onClick={cancelEdit}>✕ Anuluj</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="hero">
      {heroData.background_image && (
        <img src={heroData.background_image} alt="Hero background" className="hero-bg" />
      )}
      <div className="hero-content">
        <h2>{heroData.title}</h2>
        <p>{heroData.subtitle}</p>
        <p className="description">{heroData.description}</p>
      </div>

      {isAdminLoggedIn && (
        <button className="edit-btn" onClick={toggleEditMode} title="Edytuj sekcję">
          🔨
        </button>
      )}
    </section>
  )
}
