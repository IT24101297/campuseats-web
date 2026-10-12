import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API = import.meta.env.VITE_API_URL

  const fetchMenu = async () => {
    if (!API) {
      setError('VITE_API_URL environment variable is not configured.')
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
    if (API) {
      fetchMenu()
    }
  }, [API])

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>CampusEats</h1>
          <p>
            Connected Backend API URL: <code>{API || 'Not configured'}</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>

        {/* Live Menu Section */}
        <section className="menu-container">
          <div className="menu-header">
            <h2>Campus Menu</h2>
            <button
              type="button"
              className="refresh-btn"
              onClick={fetchMenu}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Menu'}
            </button>
          </div>

          {loading && (
            <div className="menu-status loading-state">
              <span className="spinner"></span> Loading menu items from PostgreSQL...
            </div>
          )}

          {error && (
            <div className="menu-status error-state">
              <p>⚠️ Error: {error}</p>
              <button type="button" className="retry-btn" onClick={fetchMenu}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && menuItems.length === 0 && (
            <div className="menu-status empty-state">
              {API ? 'No menu items found in the database.' : 'Configure VITE_API_URL to load items.'}
            </div>
          )}

          {!loading && !error && menuItems.length > 0 && (
            <div className="menu-grid">
              {menuItems.map((item) => (
                <div key={item.id} className="menu-card">
                  <div className="menu-item-info">
                    <span className="item-id">#{item.id}</span>
                    <h3 className="item-name">{item.name}</h3>
                  </div>
                  <div className="item-price">
                    Rs. {Number(item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
