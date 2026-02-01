import { useState, useEffect } from 'react'
import apiClient from '../axiosConfig'
import './Order.css'

interface Apple {
  _id: string
  name: string
  description: string
  price: number
  photo_url?: string
  available: boolean
}

interface AppleSelection {
  apple_id: string
  quantity_kg: number
}

interface OrderFormData {
  apples: AppleSelection[]
  packaging: 'own' | 'box'
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_datetime: string
}

export default function Order() {
  const [apples, setApples] = useState<Apple[]>([])
  const [selectedApples, setSelectedApples] = useState<AppleSelection[]>([])
  const [formData, setFormData] = useState<OrderFormData>({
    apples: [],
    packaging: 'box',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_datetime: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApples()
  }, [])

  useEffect(() => {
    // Update form apples when selectedApples changes
    setFormData(prev => ({
      ...prev,
      apples: selectedApples
    }))
  }, [selectedApples])

  const fetchApples = async () => {
    try {
      const response = await apiClient.get('/apples/')
      setApples(response.data.apples)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch apples:', err)
      // Use demo apples for development
      setApples([
        { _id: '1', name: 'Gala', description: 'Słodkie i socziste', price: 4.50, available: true },
        { _id: '2', name: 'Jonagold', description: 'Mieszanka słodkości i kwaskości', price: 5.00, available: true },
        { _id: '3', name: 'Granny Smith', description: 'Kwaskowe i chrupkie', price: 4.00, available: true },
        { _id: '4', name: 'Fuji', description: 'Słodkie z nutą kardamonu', price: 5.50, available: true },
      ])
      setLoading(false)
    }
  }

  const addApple = (appleId: string) => {
    // Check if already selected
    if (selectedApples.find(a => a.apple_id === appleId)) {
      return
    }
    setSelectedApples([...selectedApples, { apple_id: appleId, quantity_kg: 10 }])
  }

  const removeApple = (appleId: string) => {
    setSelectedApples(selectedApples.filter(a => a.apple_id !== appleId))
  }

  const updateAppleQuantity = (appleId: string, quantity: number) => {
    if (quantity < 10) quantity = 10
    setSelectedApples(
      selectedApples.map(a =>
        a.apple_id === appleId ? { ...a, quantity_kg: quantity } : a
      )
    )
  }

  const getMinPickupDate = () => {
    const today = new Date()
    const totalQuantity = selectedApples.reduce((sum, a) => sum + a.quantity_kg, 0)

    // Larger orders need more notice
    let daysNeeded = 1
    if (totalQuantity > 50) daysNeeded = 3
    else if (totalQuantity > 30) daysNeeded = 2

    const minDate = new Date(today.getTime() + daysNeeded * 24 * 60 * 60 * 1000)
    return minDate.toISOString().split('T')[0]
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (selectedApples.length === 0) {
      setError('Wybierz co najmniej jedną odmianę jabłek')
      setSubmitting(false)
      return
    }

    try {
      await apiClient.post('/orders/', formData)
      setSubmitted(true)
      setSelectedApples([])
      setFormData({
        apples: [],
        packaging: 'box',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        pickup_datetime: '',
      })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError('Nie udało się złożyć zamówienia. Spróbuj ponownie.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="order">
        <div className="container">
          <h2>Zamów Jabłka</h2>
          <p className="loading">Ładowanie dostępnych odmian...</p>
        </div>
      </section>
    )
  }

  const totalQuantity = selectedApples.reduce((sum, a) => sum + a.quantity_kg, 0)
  const totalPrice = selectedApples.reduce((sum, selection) => {
    const apple = apples.find(a => a._id === selection.apple_id)
    if (!apple) return sum
    return sum + apple.price * selection.quantity_kg
  }, 0)
  const packagingCost = formData.packaging === 'box' ? totalQuantity * 2 : 0

  return (
    <section className="order">
      <div className="container">
        <h2>Zamów Jabłka</h2>
        <p className="order-intro">
          Zamów świeże jabłka bezpośrednio z naszego sadu. Minimum 10 kg na odmianę.
        </p>

        <div className="order-layout">
          {/* Apple Selection */}
          <div className="apple-selection">
            <h3>Wybierz odmiany</h3>
            <p className="selection-hint">Kliknij na jabłko, aby je dodać do zamówienia</p>
            <div className="apple-list">
              {apples.map(apple => (
                <button
                  key={apple._id}
                  className={`apple-card ${selectedApples.some(a => a.apple_id === apple._id) ? 'selected' : ''} ${!apple.available ? 'unavailable' : ''}`}
                  onClick={() => addApple(apple._id)}
                  disabled={!apple.available || selectedApples.some(a => a.apple_id === apple._id)}
                >
                  <div className="apple-emoji">🍎</div>
                  <div className="apple-info">
                    <h4>{apple.name}</h4>
                    <p className="description">{apple.description}</p>
                    <p className="price">{apple.price.toFixed(2)} zł/kg</p>
                  </div>
                  {!apple.available && <span className="unavailable-badge">Niedostępne</span>}
                  {selectedApples.some(a => a.apple_id === apple._id) && <span className="added-badge">✓ Dodane</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Order Form */}
          <form onSubmit={handleSubmit} className="order-form">
            <h3>Szczegóły zamówienia</h3>

            {submitted && (
              <div className="success-message">
                ✓ Dziękujemy za zamówienie! Skontaktujemy się z Tobą wkrótce.
              </div>
            )}
            {error && (
              <div className="error-message">
                ✗ {error}
              </div>
            )}

            {/* Selected Apples */}
            {selectedApples.length > 0 && (
              <div className="selected-apples">
                <h4>Twój wybór:</h4>
                <div className="selected-list">
                  {selectedApples.map(selection => {
                    const apple = apples.find(a => a._id === selection.apple_id)
                    if (!apple) return null
                    return (
                      <div key={selection.apple_id} className="selected-item">
                        <div className="item-info">
                          <h5>{apple.name}</h5>
                          <div className="quantity-input-group">
                            <label>Ilość (kg):</label>
                            <input
                              type="number"
                              min="10"
                              step="5"
                              value={selection.quantity_kg}
                              onChange={(e) => updateAppleQuantity(selection.apple_id, parseInt(e.target.value) || 10)}
                              className="qty-input"
                            />
                            <small>{apple.price.toFixed(2)} zł/kg</small>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={selection.quantity_kg}
                            onChange={(e) => updateAppleQuantity(selection.apple_id, parseInt(e.target.value))}
                            className="qty-slider"
                          />
                        </div>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeApple(selection.apple_id)}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Packaging Selection */}
            <div className="form-group">
              <label>Opakowanie *</label>
              <div className="packaging-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="packaging"
                    value="own"
                    checked={formData.packaging === 'own'}
                    onChange={handleChange}
                  />
                  <span>Swoje opakowanie (darmowe)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="packaging"
                    value="box"
                    checked={formData.packaging === 'box'}
                    onChange={handleChange}
                  />
                  <span>Nasze pudełko (+2 zł za kg)</span>
                </label>
              </div>
            </div>

            {/* Price Preview */}
            {totalQuantity > 0 && (
              <div className="price-preview">
                <div className="price-row">
                  <span>Razem jabłek:</span>
                  <strong>{totalQuantity} kg</strong>
                </div>
                <div className="price-row">
                  <span>Wartość owoców:</span>
                  <strong>{totalPrice.toFixed(2)} zł</strong>
                </div>
                {packagingCost > 0 && (
                  <div className="price-row">
                    <span>Opakowanie:</span>
                    <strong>{packagingCost.toFixed(2)} zł</strong>
                  </div>
                )}
                <div className="price-row total">
                  <span>Razem:</span>
                  <strong>{(totalPrice + packagingCost).toFixed(2)} zł</strong>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="form-group">
              <label htmlFor="customer_name">Imię i nazwisko *</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                placeholder="Twoje imię i nazwisko"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_phone">Telefon *</label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                required
                placeholder="+48..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_email">Email (opcjonalnie)</label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                placeholder="twój@email.com"
              />
              <small>Wyślemy fakturę i pinezkę miejsca odbioru</small>
            </div>

            {/* Pickup Date & Time */}
            <div className="form-group">
              <label>Data i godzina odbioru *</label>
              <div className="datetime-inputs">
                <div className="date-input-wrapper">
                  <label htmlFor="pickup_date" className="sublabel">Data *</label>
                  <input
                    type="date"
                    id="pickup_date"
                    name="pickup_date"
                    value={formData.pickup_datetime.split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value
                      const time = formData.pickup_datetime.split('T')[1] || '08:00'
                      setFormData(prev => ({
                        ...prev,
                        pickup_datetime: date && time ? `${date}T${time}` : ''
                      }))
                    }}
                    required
                    min={getMinPickupDate()}
                  />
                </div>
                <div className="time-select-wrapper">
                  <label htmlFor="pickup_time" className="sublabel">Godzina *</label>
                  <select
                    id="pickup_time"
                    name="pickup_time"
                    value={formData.pickup_datetime.split('T')[1] || ''}
                    onChange={(e) => {
                      const date = formData.pickup_datetime.split('T')[0] || ''
                      const time = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        pickup_datetime: date && time ? `${date}T${time}` : ''
                      }))
                    }}
                    required
                  >
                    <option value="">Wybierz godzinę</option>
                    {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              {totalQuantity > 30 && (
                <small>⏰ Duże zamówienie - minimum {Math.ceil((totalQuantity - 30) / 20 + 1)} dnia z wyprzedzeniem</small>
              )}
            </div>

            <button 
              type="submit" 
              disabled={submitting || selectedApples.length === 0} 
              className="submit-btn"
            >
              {submitting ? 'Zatwierdzanie...' : 'Złóż zamówienie'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
