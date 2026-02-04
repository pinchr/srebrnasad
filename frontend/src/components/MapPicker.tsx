import { useEffect, useRef, useState } from 'react'
import apiClient from '../axiosConfig'
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
  const [orchardLat, setOrchardLat] = useState(52.49112601595363)
  const [orchardLon, setOrchardLon] = useState(20.32534254089926)

  // Fetch orchard config on mount
  useEffect(() => {
    const fetchOrchardConfig = async () => {
      try {
        const response = await apiClient.get('/orders/config')
        setOrchardLat(response.data.lat)
        setOrchardLon(response.data.lon)
      } catch (err) {
        console.error('Failed to fetch orchard config:', err)
        // Keep default coordinates
      }
    }
    fetchOrchardConfig()
  }, [])
 
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

    map.current = L.map(mapContainer.current).setView([startLat, startLon], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    // Add orchard marker with apple emoji
    L.marker([orchardLat, orchardLon], {
      icon: L.divIcon({
        html: '<div style="font-size: 2.5rem; text-shadow: 2px 2px 2px rgba(0,0,0,0.3);">🍎</div>',
        iconSize: [32, 32],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
        className: 'apple-marker'
      })
    })
      .addTo(map.current)
      .bindPopup('🍎 Srebrna 15 (Sad)')

    // Add user marker if coordinates exist (location pin emoji)
    if (lat && lon) {
      marker.current = L.marker([lat, lon], {
        icon: L.divIcon({
          html: '<div style="font-size: 2rem; text-shadow: 2px 2px 2px rgba(0,0,0,0.3);">📍</div>',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
          className: 'location-marker'
        })
      })
        .addTo(map.current)
        .bindPopup(`${address || 'Wybrany adres'}`)
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
          icon: L.divIcon({
            html: '<div style="font-size: 2rem; text-shadow: 2px 2px 2px rgba(0,0,0,0.3);">📍</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
            className: 'location-marker'
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
          <p className="map-hint">💡 Kliknij na mapie, aby wybrać adres dostawy.</p>
        </div>
      )}
    </div>
  )
}
