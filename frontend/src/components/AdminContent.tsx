import { useState, useEffect } from 'react'
import apiClient from '../axiosConfig'
import './AdminContent.css'

interface Apple {
  _id: string
  name: string
  description: string
  price: number
  photo_url?: string
  available: boolean
}

interface AdminContentProps {
  onClose: () => void
}

export default function AdminContent({ onClose }: AdminContentProps) {
  const [tab, setTab] = useState<'apples' | 'gallery' | 'about'>('apples')
  const [apples, setApples] = useState<Apple[]>([])
  const [loading, setLoading] = useState(true)
  const [editingApple, setEditingApple] = useState<Apple | null>(null)
  const [newApple, setNewApple] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    available: true
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (tab === 'apples') {
      fetchApples()
    }
  }, [tab])

  const fetchApples = async () => {
    try {
      const response = await apiClient.get('/apples/')
      setApples(response.data.apples)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch apples:', err)
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : name === 'available' ? (value === 'true') : value
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0])
    }
  }

  const saveApple = async () => {
    try {
      setMessage('Zapisywanie...')
      
      // Upload photo if selected
      let photoUrl = editingApple?.photo_url || ''
      if (photoFile) {
        const formDataWithPhoto = new FormData()
        formDataWithPhoto.append('file', photoFile)
        const photoResponse = await apiClient.post('/upload', formDataWithPhoto, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        photoUrl = photoResponse.data.url
      }

      const appleData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        available: formData.available,
        photo_url: photoUrl
      }

      if (editingApple) {
        await apiClient.put(`/apples/${editingApple._id}`, appleData)
        setMessage('✓ Odmiana zaktualizowana')
      } else {
        await apiClient.post('/apples', appleData)
        setMessage('✓ Odmiana dodana')
      }

      setFormData({ name: '', description: '', price: 0, available: true })
      setPhotoFile(null)
      setEditingApple(null)
      setNewApple(false)
      setTimeout(() => {
        fetchApples()
        setMessage('')
      }, 1000)
    } catch (err) {
      setMessage('✗ Błąd przy zapisywaniu')
      console.error(err)
    }
  }

  const deleteApple = async (id: string) => {
    if (!window.confirm('Na pewno chcesz usunąć tę odmianę?')) return
    
    try {
      await apiClient.delete(`/apples/${id}`)
      setMessage('✓ Odmiana usunięta')
      setTimeout(() => {
        fetchApples()
        setMessage('')
      }, 1000)
    } catch (err) {
      setMessage('✗ Błąd przy usuwaniu')
      console.error(err)
    }
  }

  const editApple = (apple: Apple) => {
    setEditingApple(apple)
    setNewApple(false)
    setFormData({
      name: apple.name,
      description: apple.description,
      price: apple.price,
      available: apple.available
    })
  }

  const cancelEdit = () => {
    setEditingApple(null)
    setNewApple(false)
    setFormData({ name: '', description: '', price: 0, available: true })
    setPhotoFile(null)
  }

  return (
    <div className="admin-content-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Zarządzanie Zawartością</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="content-tabs">
          <button 
            className={`tab-btn ${tab === 'apples' ? 'active' : ''}`}
            onClick={() => setTab('apples')}
          >
            🍎 Odmiany Jabłek
          </button>
          <button 
            className={`tab-btn ${tab === 'gallery' ? 'active' : ''}`}
            onClick={() => setTab('gallery')}
          >
            📸 Galeria
          </button>
          <button 
            className={`tab-btn ${tab === 'about' ? 'active' : ''}`}
            onClick={() => setTab('about')}
          >
            ℹ️ O Nas
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Apples Tab */}
        {tab === 'apples' && (
          <div className="tab-content">
            {!editingApple && !newApple ? (
              <>
                <button className="add-btn" onClick={() => setNewApple(true)}>
                  ➕ Dodaj nową odmianę
                </button>

                {loading ? (
                  <p className="loading">Ładowanie...</p>
                ) : (
                  <div className="apples-grid">
                    {apples.map(apple => (
                      <div key={apple._id} className="apple-item-card">
                        {apple.photo_url && (
                          <div className="apple-photo">
                            <img src={apple.photo_url} alt={apple.name} />
                          </div>
                        )}
                        <h4>{apple.name}</h4>
                        <p className="price">{apple.price.toFixed(2)} zł/kg</p>
                        <p className="description">{apple.description.substring(0, 60)}...</p>
                        <p className="status">
                          {apple.available ? '✓ Dostępna' : '✗ Niedostępna'}
                        </p>
                        <div className="apple-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => editApple(apple)}
                          >
                            ✏️ Edytuj
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteApple(apple._id)}
                          >
                            🗑️ Usuń
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="form-section">
                <h4>{editingApple ? 'Edytuj odmianę' : 'Dodaj nową odmianę'}</h4>
                
                <div className="form-group">
                  <label>Nazwa *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="np. Gala"
                  />
                </div>

                <div className="form-group">
                  <label>Opis *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Krótki opis odmiany..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Cena (zł/kg) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.10"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Dostępność</label>
                  <select
                    name="available"
                    value={formData.available.toString()}
                    onChange={handleInputChange}
                  >
                    <option value="true">✓ Dostępna</option>
                    <option value="false">✗ Niedostępna</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Zdjęcie</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {photoFile && <p className="file-info">✓ Zaznaczono: {photoFile.name}</p>}
                  {editingApple?.photo_url && !photoFile && (
                    <p className="file-info">✓ Obecne zdjęcie będzie zachowane</p>
                  )}
                </div>

                <div className="form-actions">
                  <button className="save-btn" onClick={saveApple}>
                    💾 Zapisz
                  </button>
                  <button className="cancel-btn" onClick={cancelEdit}>
                    ✕ Anuluj
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {tab === 'gallery' && (
          <div className="tab-content">
            <h4>Zarządzanie Galerią</h4>
            <p>Funkcja niedostępna - dostępna w następnej wersji</p>
          </div>
        )}

        {/* About Tab */}
        {tab === 'about' && (
          <div className="tab-content">
            <h4>Edytuj Sekcję "O Nas"</h4>
            <p>Funkcja niedostępna - dostępna w następnej wersji</p>
          </div>
        )}
      </div>
    </div>
  )
}
