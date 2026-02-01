import { useState } from 'react'
import axios from 'axios'
import './Contact.css'

interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post('/api/contact/', formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError('Failed to send message. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="contact">
      <div className="container">
        <h2>Kontakt</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Skontaktuj się z nami</h3>
            <p>
              Masz pytania o nasze jabłka lub chcesz złożyć większe zamówienie? 
              Skontaktuj się z nami poprzez formularz lub zadzwoń bezpośrednio.
            </p>
            <div className="info-item">
              <span className="label">📍 Adres:</span>
              <p>Srebrna 15, 09-162 Nacpolsk, Polska</p>
            </div>
            <div className="info-item">
              <span className="label">📞 Telefon:</span>
              <p>+48 509518545</p>
            </div>
            <div className="info-item">
              <span className="label">✉️ Email:</span>
              <p>info@srebrnasad.pl</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            {submitted && (
              <div className="success-message">
                ✓ Dziękujemy! Otrzymaliśmy Twoją wiadomość.
              </div>
            )}
            {error && (
              <div className="error-message">
                ✗ {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Imię i nazwisko *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Twoje imię i nazwisko"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="twój@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefon</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+48..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Wiadomość *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Twoja wiadomość..."
                rows={5}
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Wysyłanie...' : 'Wyślij wiadomość'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
