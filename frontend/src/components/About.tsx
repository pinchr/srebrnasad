import { useState } from 'react'
import axios from 'axios'
import { useAdmin } from '../AdminContext'
import './About.css'

interface AboutCard {
  icon: string
  title: string
  description: string
}

export default function About() {
  const { isAdminLoggedIn } = useAdmin()
  const [isEditMode, setIsEditMode] = useState(false)
  const [cards, setCards] = useState<AboutCard[]>([
    {
      icon: '🌳',
      title: 'Nasz Sad',
      description: 'Znajdujący się w Srebrnej, Naruszewo, nasz sad od pokoleń uprawia świeże, pyszne jabłka. Stosujemy zrównoważone metody uprawy.'
    },
    {
      icon: '🍎',
      title: 'Jabłka Najwyższej Jakości',
      description: 'Uprawiamy wiele odmian jabłek, każdą wybraną ze względu na jej unikalny smak i wartość odżywczą. Wszystkie nasze jabłka są zbierane świeże.'
    },
    {
      icon: '👨‍🌾',
      title: 'Tradycja Rodzinna',
      description: 'Nasza rodzina uprawia ziemię w Naruszewie od dziesięcioleci. Łączymy tradycyjną wiedzę z nowoczesnymi technikami uprawy.'
    }
  ])
  const [message, setMessage] = useState('')

  const saveChanges = async () => {
    try {
      setMessage('Zapisywanie...')
      await axios.post('/api/content/about', { cards })
      setIsEditMode(false)
      setMessage('✓ Zapisano!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('✗ Błąd przy zapisywaniu')
      console.error(err)
    }
  }

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards]
    newCards[index] = { ...newCards[index], [field]: value }
    setCards(newCards)
  }

  if (isEditMode) {
    return (
      <section className="about-edit">
        <div className="edit-container">
          <h3>Edytuj Sekcję "O Nas"</h3>
          {message && <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>{message}</div>}

          {cards.map((card, idx) => (
            <div key={idx} className="card-editor">
              <div className="form-group">
                <label>Ikona</label>
                <input
                  type="text"
                  value={card.icon}
                  onChange={(e) => updateCard(idx, 'icon', e.target.value)}
                  placeholder="np. 🌳"
                  maxLength={2}
                />
              </div>
              <div className="form-group">
                <label>Tytuł</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(idx, 'title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Opis</label>
                <textarea
                  value={card.description}
                  onChange={(e) => updateCard(idx, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button className="save-btn" onClick={saveChanges}>💾 Zapisz</button>
            <button className="cancel-btn" onClick={() => setIsEditMode(false)}>✕ Anuluj</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="about">
      <div className="container">
        <h2>O nas</h2>
        <div className="about-grid">
          {cards.map((card, idx) => (
            <div key={idx} className="about-card">
              <h3>{card.icon} {card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </div>

      {isAdminLoggedIn && (
        <button className="edit-btn" onClick={() => setIsEditMode(true)} title="Edytuj sekcję">
          🔨
        </button>
      )}
    </section>
  )
}
