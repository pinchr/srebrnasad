import { useState, useEffect } from 'react'
import apiClient from '../axiosConfig'
import MapPicker from './MapPicker'
import './Order.css'

interface Apple {
  _id: string
  name: string
  description: string
  price: number
  photo_url?: string
  available: boolean
  max_quantity_kg?: number
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
  delivery: boolean
  delivery_address: string
  delivery_lat: number | null
  delivery_lon: number | null
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
    delivery: false,
    delivery_address: '',
    delivery_lat: null,
    delivery_lon: null,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [deliveryValidation, setDeliveryValidation] = useState<{
    valid: boolean
    distance_km?: number
    delivery_fee: number
    error?: string
  } | null>(null)
  const [geocoding, setGeocoding] = useState(false)

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

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) {
      setDeliveryValidation({
        valid: false,
        delivery_fee: 0,
        error: 'Podaj adres'
      })
      return
    }

    setGeocoding(true)
    try {
      // Use Nominatim OSM (reliable for Polish addresses)
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=PL&limit=1&addressdetails=1`
      )
      const geocodeData = await geocodeResponse.json()
      
      if (!Array.isArray(geocodeData) || geocodeData.length === 0) {
        setDeliveryValidation({
          valid: false,
          delivery_fee: 0,
          error: 'Nie znaleziono adresu. Spróbuj inną nazwę lub kod pocztowy.'
        })
        return
      }

      const lat = parseFloat(geocodeData[0].lat)
      const lon = parseFloat(geocodeData[0].lon)

      // Calculate real route distance using OSRM (not straight line)
      const orchardLon = 20.8445
      const orchardLat = 52.3138

      try {
        const routeResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${orchardLon},${orchardLat};${lon},${lat}?overview=false`
        )
        const routeData = await routeResponse.json()

        if (routeData.routes && routeData.routes.length > 0) {
          // Distance from OSRM is in meters
          const distanceKm = Math.round((routeData.routes[0].distance / 1000) * 10) / 10 // Round to 1 decimal

          const totalQuantity = selectedApples.reduce((sum, a) => sum + a.quantity_kg, 0)

          // Update form data with coordinates
          setFormData(prev => ({
            ...prev,
            delivery_lat: lat,
            delivery_lon: lon
          }))

          // Validate with backend
          if (totalQuantity > 0) {
            try {
              const validationResponse = await apiClient.post('/orders/validate-delivery', {
                total_quantity_kg: totalQuantity,
                delivery_lat: lat,
                delivery_lon: lon
              })
              
              // Update with real distance from OSRM
              if (validationResponse.data.valid) {
                setDeliveryValidation({
                  ...validationResponse.data,
                  distance_km: distanceKm
                })
              } else {
                setDeliveryValidation(validationResponse.data)
              }
            } catch (err) {
              console.error('Delivery validation failed:', err)
              setDeliveryValidation({
                valid: false,
                delivery_fee: 0,
                error: 'Błąd walidacji dostawy. Spróbuj ponownie.'
              })
            }
          }
        } else {
          // Fallback if OSRM fails
          setDeliveryValidation({
            valid: false,
            delivery_fee: 0,
            error: 'Nie udało się obliczyć dystansu. Spróbuj ponownie.'
          })
        }
      } catch (err) {
        console.error('Route calculation failed:', err)
        setDeliveryValidation({
          valid: false,
          delivery_fee: 0,
          error: 'Błąd obliczania dystansu. Spróbuj ponownie.'
        })
      }
    } catch (err) {
      console.error('Geocoding failed:', err)
      setDeliveryValidation({
        valid: false,
        delivery_fee: 0,
        error: 'Błąd wyszukiwania adresu. Spróbuj ponownie.'
      })
    } finally {
      setGeocoding(false)
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

    // Validate pickup date/time for non-delivery orders
    if (!formData.delivery) {
      if (!formData.pickup_datetime) {
        setError('Wybierz datę i godzinę odbioru')
        setSubmitting(false)
        return
      }
    }

    // Validate delivery
    if (formData.delivery) {
      if (!formData.delivery_address.trim()) {
        setError('Podaj adres dostawy')
        setSubmitting(false)
        return
      }
      if (!deliveryValidation?.valid) {
        setError(deliveryValidation?.error || 'Sprawdź dostępność dostawy dla tego adresu')
        setSubmitting(false)
        return
      }
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
        delivery: false,
        delivery_address: '',
        delivery_lat: null,
        delivery_lon: null,
      })
      setDeliveryValidation(null)
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
  // Packaging: 5 zł per 15kg returnable package
  const numPackages = formData.packaging === 'box' ? Math.ceil(totalQuantity / 15) : 0
  const packagingCost = numPackages * 5
  const deliveryCost = deliveryValidation?.valid ? (deliveryValidation.delivery_fee || 0) : 0

  return (
    <section className="order">
      <div className="container">
        <h2>Zamów Jabłka</h2>
        <p className="order-intro">
          Zamów świeże jabłka bezpośrednio z naszego sadu. Minimum 10 kg na odmianę.
          <br />
          <small style={{ marginTop: '0.5rem', display: 'block', color: '#666' }}>
            💡 Zamówienia powyżej 250 kg jednej odmiany obsługujemy w dużych skrzyniach. Skontaktuj się z nami aby uzyskać cenę hurtową.
          </small>
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
                  <div className="apple-photo">
                    {apple.photo_url ? (
                      <img src={apple.photo_url} alt={apple.name} />
                    ) : (
                      <div className="apple-emoji">🍎</div>
                    )}
                  </div>
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
                    const maxQuantity = Math.min(250, apple.max_quantity_kg || 250)
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
                              max={maxQuantity}
                              value={selection.quantity_kg}
                              onChange={(e) => updateAppleQuantity(selection.apple_id, parseInt(e.target.value) || 10)}
                              className="qty-input"
                            />
                            <small>{apple.price.toFixed(2)} zł/kg</small>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max={maxQuantity}
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
              {formData.delivery ? (
                <div className="packaging-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="packaging"
                      value="box"
                      checked={true}
                      onChange={() => {}}
                      disabled
                    />
                    <span>Nasze pudełko (5 zł za 15kg)</span>
                  </label>
                  <small style={{ marginTop: '0.5rem', display: 'block', color: '#666' }}>
                    Pudełka można zwrócić (system kaucyjny). Przy dostawie wymagane jest nasze pudełko.
                  </small>
                </div>
              ) : (
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
                    <span>Nasze pudełko (5 zł za 15kg)</span>
                  </label>
                  <small style={{ marginTop: '0.5rem', display: 'block', color: '#666' }}>
                    Pudełka mogą zostać zwrócone za pełną kwotę kaucji (system kaucyjny).
                  </small>
                </div>
              )}
            </div>

            {/* Delivery Option */}
            <div className="form-group">
              <label className={`checkbox-label ${totalQuantity < 200 ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.delivery}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Enable delivery and force box packaging
                      setFormData(prev => ({
                        ...prev,
                        delivery: true,
                        packaging: 'box'
                      }))
                    } else {
                      // Disable delivery
                      setFormData(prev => ({
                        ...prev,
                        delivery: false
                      }))
                      setDeliveryValidation(null)
                    }
                  }}
                  disabled={totalQuantity < 200}
                />
                <span>🚚 Dostawa do domu (+25 zł)</span>
              </label>
              {totalQuantity < 200 ? (
                <small className="delivery-hint">
                  ℹ️ Dostawa dostępna przy zamówieniu min. 200 kg. Brakuje {200 - totalQuantity} kg do dostawy.
                </small>
              ) : (
                <small className="delivery-hint success">
                  ✓ Mamy większe zamówienie! Możesz teraz wybrać dostawę. Dostawa do 50 km od sadu.
                </small>
              )}
            </div>

            {/* Delivery Address */}
            {formData.delivery && (
              <div className="form-group">
                <label htmlFor="delivery_address">Adres dostawy *</label>
                <div className="delivery-address-group">
                  <input
                    type="text"
                    id="delivery_address"
                    value={formData.delivery_address}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        delivery_address: e.target.value
                      }))
                      // Reset validation when address changes
                      setDeliveryValidation(null)
                    }}
                    required={formData.delivery}
                    placeholder="Ulica, numer domu, kod pocztowy..."
                    disabled={geocoding}
                  />
                  <button
                    type="button"
                    onClick={() => geocodeAddress(formData.delivery_address)}
                    disabled={geocoding || !formData.delivery_address.trim()}
                    className="check-distance-btn"
                  >
                    {geocoding ? '🔍...' : '🔍 Sprawdź'}
                  </button>
                </div>
                <small>Podaj ulicę, numer domu i kod pocztowy, np. "Płońska 12, 09-100 Płońsk"</small>
                
                {/* Map Picker for Address Selection */}
                <MapPicker
                  address={formData.delivery_address}
                  lat={formData.delivery_lat}
                  lon={formData.delivery_lon}
                  onAddressChange={(newAddress, newLat, newLon) => {
                    setFormData(prev => ({
                      ...prev,
                      delivery_address: newAddress,
                      delivery_lat: newLat,
                      delivery_lon: newLon
                    }))
                    // Auto-validate new coordinates
                    geocodeAddress(newAddress)
                  }}
                />
                
                {deliveryValidation && (
                  <>
                    {deliveryValidation.valid ? (
                      <small className="success-text">
                        ✓ Dystans: {deliveryValidation.distance_km} km | Dostawa: {deliveryValidation.delivery_fee.toFixed(2)} zł
                      </small>
                    ) : (
                      <small className="error-text">
                        ✗ {deliveryValidation.error}
                      </small>
                    )}
                  </>
                )}
              </div>
            )}

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
                    <span>Opakowanie ({numPackages} x 15kg pudełka):</span>
                    <strong>{packagingCost.toFixed(2)} zł</strong>
                  </div>
                )}
                {formData.delivery && deliveryValidation?.valid && (
                  <div className="price-row">
                    <span>Dostawa ({deliveryValidation.distance_km} km):</span>
                    <strong>{deliveryCost.toFixed(2)} zł</strong>
                  </div>
                )}
                <div className="price-row total">
                  <span>Razem:</span>
                  <strong>{(totalPrice + packagingCost + deliveryCost).toFixed(2)} zł</strong>
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

            {/* Pickup Date & Time - Hidden if delivery selected */}
            {!formData.delivery && (
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
            )}

            {/* Delivery Date Info */}
            {formData.delivery && (
              <div className="form-group info-box">
                <p>📦 Dostawę zorganizujemy w ciągu 2-3 dni roboczych od potwierdzenia zamówienia.</p>
              </div>
            )}

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
