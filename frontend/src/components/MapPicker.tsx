import { useEffect, useRef, useState } from 'react'
import './MapPicker.css'

interface MapPickerProps {
  address: string
  lat: number | null
  lon: number | null
  onAddressChange: (address: string, lat: number, lon: number) => void
}

export default function MapPicker({ address, lat, lon, onAddressChange }: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const marker = useRef<any>(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const orchardLat = 52.3138
  const orchardLon = 20.8445

  // Initialize map when opened
  useEffect(() => {
    if (!isMapOpen || !mapContainer.current) return

    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      // Add CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      // Load JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => {
        initializeMap()
      }
      document.head.appendChild(script)
    }

    loadLeaflet()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [isMapOpen])

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return

    const L = (window as any).L
    const startLat = lat || orchardLat
    const startLon = lon || orchardLon

    map.current = L.map(mapContainer.current).setView([startLat, startLon], 8)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    // Add orchard marker
    L.circleMarker([orchardLat, orchardLon], {
      radius: 8,
      fillColor: '#4caf50',
      color: '#2c5f2d',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    })
      .addTo(map.current)
      .bindPopup('🍎 Srebrna 15, Nacpolsk (Sad)')

    // Add user marker if coordinates exist
    if (lat && lon) {
      marker.current = L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzIyNjhkMCIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyYzAgNSAzLjY0IDkuMjcgOC4zIDkuOTdWMjJjMCAwIDYgLjEgNiAwdjBjNC42NyAwIDEwLTIuMzMgMTAtMTBzLTUuMzMtMTAtMTAtMXptMCA1Yy0yLjc2IDAtNSAyLjI0LTUgNXMyLjI0IDUgNSA1IDUtMi4yNCA1LTUtMi4yNC01LTUtNXoiLz48L3N2Zz4=',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        })
      })
        .addTo(map.current)
        .bindPopup(`📍 ${address || 'Wybrany adres'}`)
    }

    // Handle map clicks to place marker
    map.current.on('click', async (e: any) => {
      const clickLat = e.latlng.lat
      const clickLon = e.latlng.lng

      setLoading(true)
      try {
        // Reverse geocode to get address
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLon}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        const newAddress = data.address?.road
          ? `${data.address.road} ${data.address.house_number || ''}, ${data.address.postcode || ''} ${data.address.city || data.address.town || ''}`
          : data.display_name

        // Update marker
        if (marker.current) {
          marker.current.remove()
        }

        marker.current = L.marker([clickLat, clickLon], {
          icon: L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzIyNjhkMCIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyYzAgNSAzLjY0IDkuMjcgOC4zIDkuOTdWMjJjMCAwIDYgLjEgNiAwdjBjNC42NyAwIDEwLTIuMzMgMTAtMTBzLTUuMzMtMTAtMTAtMXptMCA1Yy0yLjc2IDAtNSAyLjI0LTUgNXMyLjI0IDUgNSA1IDUtMi4yNCA1LTUtMi4yNC01LTUtNXoiLz48L3N2Zz4=',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          })
        })
          .addTo(map.current)
          .bindPopup(newAddress)
          .openPopup()

        // Call parent callback
        onAddressChange(newAddress, clickLat, clickLon)
      } catch (err) {
        console.error('Error reverse geocoding:', err)
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="map-picker">
      <button
        type="button"
        className="map-toggle-btn"
        onClick={() => setIsMapOpen(!isMapOpen)}
      >
        {isMapOpen ? '❌ Zamknij mapę' : '🗺️ Wybierz adres na mapie'}
      </button>

      {isMapOpen && (
        <div className="map-wrapper">
          <div ref={mapContainer} className="map-container" />
          {loading && <div className="map-loading">Ładowanie...</div>}
          <p className="map-hint">💡 Kliknij na mapie, aby wybrać adres dostawy. 🟢 Zielony punkt to Twój sad.</p>
        </div>
      )}
    </div>
  )
}
