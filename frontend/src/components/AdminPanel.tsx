import { useState, useEffect } from 'react'
import apiClient from '../axiosConfig'
import AdminContent from './AdminContent'
import './AdminPanel.css'

interface AdminPanelProps {
  setCurrentPage: React.Dispatch<React.SetStateAction<'home' | 'gallery' | 'contact' | 'order' | 'admin'>>
}

interface OrderItem {
  apple_id: string
  apple_name: string
  quantity_kg: number
  price_per_kg: number
  subtotal: number
}

interface Order {
  id: string
  apples: OrderItem[]
  packaging: string
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_date: string
  pickup_time: string
  status: string
  total_quantity_kg: number
  total_price: number
  created_at: string
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled'

export default function AdminPanel({ setCurrentPage }: AdminPanelProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [showContentModal, setShowContentModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/orders' 
        : `/orders?status_filter=${statusFilter}`
      const response = await apiClient.get(url)
      setOrders(response.data.orders || [])
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      await apiClient.put(`/orders/${orderId}/status`, { new_status: newStatus })
      fetchOrders()
    } catch (err) {
      console.error('Failed to update order status:', err)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const sendSMS = (phone: string, orderNum: string, status: string) => {
    const statusMessages: Record<string, string> = {
      pending: 'Twoje zamówienie zostało przyjęte i oczekuje na potwierdzenie.',
      confirmed: 'Twoje zamówienie zostało potwierdzone! Przygotowujemy jabłka.',
      ready: 'Twoje zamówienie jest gotowe do odbioru!\n\nZapraszamy do Srebrnej 15, 09-162 Nacpolsk\n\n📍 Mapa: https://maps.google.com/?q=Srebrna+15,+09-162+Nacpolsk',
      picked_up: 'Dziękujemy za odbiór! Zapraszamy ponownie! 🍎',
      cancelled: 'Twoje zamówienie zostało anulowane.'
    }
    
    const message = encodeURIComponent(
      `Srebrna Sad - Zamówienie #${orderNum}\n\n${statusMessages[status] || getStatusLabel(status)}\n\nTelefon: +48 XXX XXX XXX\ninfo@srebrnasad.pl\n\n🍎 Srebrna Sad`
    )
    // Opens SMS on phone
    window.location.href = `sms:${phone}?body=${message}`
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Oczekujące',
      confirmed: 'Potwierdzone',
      ready: 'Gotowe do odbioru',
      picked_up: 'Odebrane',
      cancelled: 'Anulowane'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      ready: '#4caf50',
      picked_up: '#9c27b0',
      cancelled: '#f44336'
    }
    return colors[status] || '#999'
  }

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)

  return (
    <section className="admin-panel">
      <div className="admin-header">
        <h2>Panel Administracyjny</h2>
        <div className="header-buttons">
          <button 
            className="content-btn"
            onClick={() => setShowContentModal(true)}
            title="Zarządzaj zawartością strony"
          >
            📝 Zawartość
          </button>
          <button 
            className="back-btn"
            onClick={() => setCurrentPage('home')}
          >
            ← Wróć
          </button>
        </div>
      </div>

      {showContentModal && <AdminContent onClose={() => setShowContentModal(false)} />}

      <div className="admin-container">
        {/* Filters */}
        <div className="filters">
          <h3>Filtry</h3>
          <div className="filter-buttons">
            {(['all', 'pending', 'confirmed', 'ready', 'picked_up', 'cancelled'] as StatusFilter[]).map(filter => (
              <button
                key={filter}
                className={`filter-btn ${statusFilter === filter ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter === 'all' ? 'Wszystkie' : getStatusLabel(filter)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-section">
          <h3>Zamówienia ({filteredOrders.length})</h3>
          
          {loading ? (
            <p className="loading">Ładowanie zamówień...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="no-orders">Brak zamówień</p>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order, index) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <h4>Zamówienie #{index + 1}</h4>
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    <div className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div className="order-content">
                    <div className="customer-info">
                      <h5>Klient</h5>
                      <p><strong>{order.customer_name}</strong></p>
                      <p>📞 {order.customer_phone}</p>
                      {order.customer_email && <p>✉️ {order.customer_email}</p>}
                    </div>

                    <div className="order-items">
                      <h5>Zamówione jabłka</h5>
                      {order.apples.map((apple, idx) => (
                        <p key={idx} className="apple-item">
                          {apple.apple_name}: <strong>{apple.quantity_kg} kg</strong>
                          <br />
                          <small>{apple.price_per_kg.toFixed(2)} zł/kg = {apple.subtotal.toFixed(2)} zł</small>
                        </p>
                      ))}
                    </div>

                    <div className="order-details">
                      <h5>Szczegóły</h5>
                      <p>📦 Opakowanie: {order.packaging === 'own' ? 'Własne' : 'Nasze pudełko'}</p>
                      <p>📍 Odbiór: {order.pickup_date} o {order.pickup_time}</p>
                      <p>💰 Razem: <strong>{order.total_price.toFixed(2)} zł</strong></p>
                    </div>
                  </div>

                  <div className="order-actions">
                    <div className="status-controls">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className="status-select"
                      >
                        <option value="pending">Oczekujące</option>
                        <option value="confirmed">Potwierdzone</option>
                        <option value="ready">Gotowe do odbioru</option>
                        <option value="picked_up">Odebrane</option>
                        <option value="cancelled">Anulowane</option>
                      </select>
                    </div>
                    
                    <button
                      className="sms-btn"
                      onClick={() => sendSMS(
                        order.customer_phone,
                        order.id.slice(-6).toUpperCase(),
                        order.status
                      )}
                      title="Wyślij SMS (otworzy aplikację SMS)"
                    >
                      💬 SMS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-info">
        <p>💡 Kliknij przycisk SMS, aby otworzyć aplikację wiadomości z wstępnie wypełnionym numerem.</p>
      </div>
    </section>
  )
}
