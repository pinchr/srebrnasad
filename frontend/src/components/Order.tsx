import { useState, useEffect } from 'react'
import axios from 'axios'
import './Order.css'

interface Apple {
  _id: string
  name: string
  description: string
  price: number
  photo_url?: string
  available: boolean
}

interface OrderFormData {
  apple_id: string
  quantity_kg: number
  packaging: 'own' | 'box'
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_date: string
  pickup_time: string
}

export default function Order() {
  const [apples, setApples] = useState<Apple[]>([])
  const [selectedApple, setSelectedApple] = useState<Apple | null>(null)
  const [formData, setFormData] = useState<OrderFormData>({
    apple_id: '',
    quantity_kg: 10,
    packaging: 'box',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_date: '',
    pickup_time: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApples()
  }, [])

  const fetchApples = async () => {
    try {
      const response = await axios.get('/api/apples')
      setApples(response.data.apples)
      if (response.data.apples.length > 0) {
        setSelectedApple(response.data.apples[0])
        setFormData(prev => ({
          ...prev,
          apple_id: response.data.apples[0]._id
        }))
      }
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch apples:', err)
      // Use demo apples for development
      setApples([
        { _id: '1', name: 'Gala', description: 'Słodkie i socziste', price: 4.50, available: true },
        { _id: '2', name: 'Jonagold', description: 'Mieszanka słodkości i kwaskości', price: 5.00, available: true },
        { _id: '3', name: 'Granny Smith', description: 'Kwaskowe i chrupkie', price: 4.00, available: true },
      ])
      setLoading(false)
    }
  }

  const handleAppleChange = (appleId: string) => {
    const apple = apples.find(a => a._id === appleId)
    if (apple) {
      setSelectedApple(apple)
      setFormData(prev => ({
        ...prev,
        apple_id: appleId
      }))
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = formData.quantity_kg + change
    if (newQuantity >= 10) {
      setFormData(prev => ({
        ...prev,
        quantity_kg: newQuantity
      }))
    }
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

    try {
      await axios.post('/api/orders', formData)
      setSubmitted(true)
      setFormData({
        apple_id: apples[0]?._id || '',
        quantity_kg: 10,
        packaging: 'box',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        pickup_date: '',
        pickup_time: '',
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

  const totalPrice = selectedApple ? selectedApple.price * formData.quantity_kg : 0

  return (
    <section className="order">
      <div className="container">
        <h2>Zamów Jabłka</h2>
        <p className="order-intro">
          Zamów świeże jabłka bezpośrednio z naszego sadu. Minimum 10 kg, można zwiększać co 5 kg.
        </p>

        <div className="order-layout">
          {/* Apple Selection */}
          <div className="apple-selection">
            <h3>Wybierz odmianę</h3>
            <div className="apple-list">
              {apples.map(apple => (
                <button
                  key={apple._id}
                  className={`apple-card ${selectedApple?._id === apple._id ? 'selected' : ''} ${!apple.available ? 'unavailable' : ''}`}
                  onClick={() => handleAppleChange(apple._id)}
                  disabled={!apple.available}
                >
                  <div className="apple-emoji">🍎</div>
                  <div className="apple-info">
                    <h4>{apple.name}</h4>
                    <p className="description">{apple.description}</p>
                    <p className="price">{apple.price.toFixed(2)} zł/kg</p>
                  </div>
                  {!apple.available && <span className="unavailable-badge">Niedostępne</span>}
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

            {/* Quantity Selection */}
            <div className="form-group">
              <label>Ilość (kg) *</label>
              <div className="quantity-selector">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-5)}
                  disabled={formData.quantity_kg <= 10}
                >
                  −
                </button>
                <span className="qty-display">{formData.quantity_kg} kg</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => handleQuantityChange(5)}
                >
                  +
                </button>
              </div>
              <small>Minimum 10 kg, zwiększaj co 5 kg</small>
            </div>

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
            <div className="price-preview">
              <div className="price-row">
                <span>Cena za kg:</span>
                <strong>{selectedApple?.price.toFixed(2)} zł</strong>
              </div>
              <div className="price-row">
                <span>Ilość:</span>
                <strong>{formData.quantity_kg} kg</strong>
              </div>
              {formData.packaging === 'box' && (
                <div className="price-row">
                  <span>Opakowanie:</span>
                  <strong>{(formData.quantity_kg * 2).toFixed(2)} zł</strong>
                </div>
              )}
              <div className="price-row total">
                <span>Razem:</span>
                <strong>
                  {(totalPrice + (formData.packaging === 'box' ? formData.quantity_kg * 2 : 0)).toFixed(2)} zł
                </strong>
              </div>
            </div>

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
              <label htmlFor="customer_email">Email *</label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                required
                placeholder="twój@email.com"
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

            {/* Pickup Date & Time */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pickup_date">Data odbioru *</label>
                <input
                  type="date"
                  id="pickup_date"
                  name="pickup_date"
                  value={formData.pickup_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="pickup_time">Godzina odbioru *</label>
                <input
                  type="time"
                  id="pickup_time"
                  name="pickup_time"
                  value={formData.pickup_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="submit-btn">
              {submitting ? 'Zatwierdzanie...' : 'Złóż zamówienie'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
