import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API = import.meta.env.VITE_API_URL

  const fetchMenu = async () => {
    if (!API) {
      setLoading(false)
      setError('VITE_API_URL is not configured.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const cleanBase = API.replace(/\/$/, '')
      const response = await fetch(`${cleanBase}/api/menu`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setMenuItems(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch menu items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  return (
    <div className="container">
      <header className="header">
        <h1>CampusEats</h1>
        <p className="subtitle">Campus Cafeteria Menu</p>
      </header>

      <main className="menu-section">
        <div className="menu-top">
          <h2>Menu Items</h2>
          <button
            type="button"
            className="refresh-btn"
            onClick={fetchMenu}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading && (
          <div className="status-msg">
            <span className="spinner"></span> Loading menu...
          </div>
        )}

        {error && (
          <div className="status-msg error-msg">
            <p>Error: {error}</p>
            <button type="button" className="retry-btn" onClick={fetchMenu}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && menuItems.length === 0 && (
          <div className="status-msg">No menu items found.</div>
        )}

        {!loading && !error && menuItems.length > 0 && (
          <div className="menu-list">
            {menuItems.map((item) => (
              <div key={item.id} className="menu-item-card">
                <div className="item-details">
                  <span className="item-id">#{item.id}</span>
                  <span className="item-name">{item.name}</span>
                </div>
                <div className="item-price">
                  Rs. {Number(item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
