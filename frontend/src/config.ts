// Determine backend URL based on how we're accessing the frontend
export const getBackendUrl = (): string => {
  const hostname = window.location.hostname
  const protocol = window.location.protocol

  // If on localhost, use relative paths (Vite proxy will handle it)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return ''
  }

  // On network IP, connect to same IP with port 8000
  // This works for Mac's IP address from iPhone/other devices
  return `${protocol}//${hostname}:8000`
}

export const API_BASE_URL = getBackendUrl()

// Log for debugging
console.log('Frontend hostname:', window.location.hostname)
console.log('Backend URL:', API_BASE_URL)
