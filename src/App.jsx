import { useState, useEffect, useMemo } from 'react'
import './App.css'

function App() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(null)
  const [apiHealth, setApiHealth] = useState({ status: 'checking', message: 'Checking API...' })

  // Read environment variable as specified by Lab requirements
  const API = import.meta.env.VITE_API_URL

  const cleanBase = useMemo(() => {
    return API ? API.replace(/\/$/, '') : ''
  }, [API])

  // Check health of backend
  const checkHealth = async () => {
    if (!cleanBase) {
      setApiHealth({ status: 'unconfigured', message: 'VITE_API_URL missing' })
      return
    }
    try {
      const res = await fetch(`${cleanBase}/health`, { signal: AbortSignal.timeout(4000) })
      if (res.ok) {
        setApiHealth({ status: 'healthy', message: 'API Online & Healthy' })
      } else {
        setApiHealth({ status: 'warning', message: `API Status ${res.status}` })
      }
    } catch {
      setApiHealth({ status: 'offline', message: 'API Offline / Connecting...' })
    }
  }

  // Fetch menu from backend PostgreSQL database
  const fetchMenu = async () => {
    if (!cleanBase) {
      setLoading(false)
      setError('Backend API URL is not configured. Please set VITE_API_URL.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${cleanBase}/api/menu`)
      if (!response.ok) {
        throw new Error(`Failed to fetch menu (HTTP ${response.status})`)
      }
      const data = await response.json()
      setMenuItems(data)
    } catch (err) {
      setError(err.message || 'Unable to connect to CampusEats backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    fetchMenu()
  }, [cleanBase])

  // Helper to map food name to emoji icon & tags
  const getItemDetails = (name = '') => {
    const lower = name.toLowerCase()
    if (lower.includes('burger')) {
      return { emoji: '🍔', tag: 'Fast Food', desc: 'Juicy patty served in toasted sesame buns.' }
    }
    if (lower.includes('kottu')) {
      return { emoji: '🧀', tag: 'Chef Special', desc: 'Chopped flatbread tossed with rich cheese and spices.' }
    }
    if (lower.includes('chicken')) {
      return { emoji: '🍗', tag: 'Student Favorite', desc: 'Steamed fragrant basmati rice with seasoned chicken.' }
    }
    if (lower.includes('veg')) {
      return { emoji: '🥗', tag: 'Vegetarian', desc: 'Wok-tossed vegetables and aromatic rice grains.' }
    }
    return { emoji: '🍱', tag: 'Canteen Special', desc: 'Freshly prepared daily meal at campus cafeteria.' }
  }

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: {
        item,
        qty: (prev[item.id]?.qty || 0) + 1,
      },
    }))
  }

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const updated = { ...prev }
      if (updated[itemId]?.qty > 1) {
        updated[itemId].qty -= 1
      } else {
        delete updated[itemId]
      }
      return updated
    })
  }

  const clearCart = () => setCart({})

  const totalCartCount = Object.values(cart).reduce((sum, entry) => sum + entry.qty, 0)
  const cartSubtotal = Object.values(cart).reduce((sum, entry) => sum + entry.item.price * entry.qty, 0)

  // Filtered menu
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (activeCategory === 'Rice') return item.name.toLowerCase().includes('rice')
    if (activeCategory === 'Kottu') return item.name.toLowerCase().includes('kottu')
    if (activeCategory === 'Burgers') return item.name.toLowerCase().includes('burger')
    return true
  })

  const handleCheckout = () => {
    const orderNumber = Math.floor(100 + Math.random() * 900)
    setOrderConfirmed({
      token: `SLIIT-${orderNumber}`,
      itemCount: totalCartCount,
      total: cartSubtotal,
    })
    clearCart()
    setIsCartOpen(false)
  }

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-logo">🍲</div>
          <div>
            <div className="brand-title">CampusEats</div>
            <div className="brand-sub">SLIIT Cafeteria Portal</div>
          </div>
        </div>

        <div className="nav-center-pill">
          <span className={`status-dot ${apiHealth.status}`}></span>
          <span className="status-text">{apiHealth.message}</span>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="cart-toggle-btn"
            onClick={() => setIsCartOpen(!isCartOpen)}
            aria-label="View Tray"
          >
            🛒 <span className="cart-label">My Tray</span>
            {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-pill">⚡ Fast Campus Pickup & Delivery</span>
          <h1>Skip the canteen rush. Order fresh food in seconds.</h1>
          <p>
            Browse real-time meals directly powered by <strong>PostgreSQL</strong> &amp; <strong>ASP.NET Core 8</strong>.
          </p>

          <div className="search-filter-box">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search food (e.g. Chicken Rice, Kottu)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
            </div>

            <div className="category-pills">
              {['All', 'Rice', 'Kottu', 'Burgers'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="section-header">
          <div>
            <h2>Today's Live Menu</h2>
            <p className="section-sub">Synchronized with Supabase Database</p>
          </div>
          <button
            type="button"
            className="refresh-menu-btn"
            onClick={() => {
              checkHealth()
              fetchMenu()
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Sync Menu'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-icon"></div>
                <div className="skeleton-line title"></div>
                <div className="skeleton-line desc"></div>
                <div className="skeleton-line price"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="error-banner">
            <div className="error-icon">⚠️</div>
            <div className="error-body">
              <h3>Connection Notice</h3>
              <p>{error}</p>
              <div className="error-api-hint">
                Configured API URL: <code>{API || 'Not configured'}</code>
              </div>
            </div>
            <button type="button" className="retry-btn" onClick={fetchMenu}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="empty-banner">
            <div className="empty-icon">🍽️</div>
            <h3>No menu items found</h3>
            <p>
              {searchTerm
                ? `No meals matching "${searchTerm}". Try another search.`
                : 'The menu is currently empty.'}
            </p>
            {searchTerm && (
              <button type="button" className="reset-btn" onClick={() => setSearchTerm('')}>
                Clear Filter
              </button>
            )}
          </div>
        )}

        {/* Live Menu Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="food-grid">
            {filteredItems.map((item) => {
              const details = getItemDetails(item.name)
              const inCartQty = cart[item.id]?.qty || 0

              return (
                <div key={item.id} className="food-card">
                  <div className="card-top">
                    <span className="food-emoji">{details.emoji}</span>
                    <span className="food-tag">{details.tag}</span>
                  </div>

                  <div className="card-info">
                    <div className="item-meta">
                      <span className="item-badge">ID #{item.id}</span>
                    </div>
                    <h3 className="food-title">{item.name}</h3>
                    <p className="food-desc">{details.desc}</p>
                  </div>

                  <div className="card-footer">
                    <div className="food-price">
                      <span className="currency">Rs.</span> {Number(item.price).toFixed(2)}
                    </div>

                    {inCartQty > 0 ? (
                      <div className="card-qty-control">
                        <button type="button" onClick={() => removeFromCart(item.id)}>
                          -
                        </button>
                        <span>{inCartQty}</span>
                        <button type="button" onClick={() => addToCart(item)}>
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="add-to-cart-btn"
                        onClick={() => addToCart(item)}
                      >
                        + Add to Tray
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Your Food Tray ({totalCartCount})</h3>
              <button type="button" className="close-drawer" onClick={() => setIsCartOpen(false)}>
                ✕
              </button>
            </div>

            <div className="drawer-items">
              {totalCartCount === 0 ? (
                <div className="cart-empty-message">
                  <p>Your tray is empty.</p>
                  <p className="hint">Select food items from the menu to get started.</p>
                </div>
              ) : (
                Object.values(cart).map(({ item, qty }) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <div className="cart-item-rate">Rs. {Number(item.price).toFixed(2)} each</div>
                    </div>
                    <div className="cart-qty-buttons">
                      <button type="button" onClick={() => removeFromCart(item.id)}>
                        -
                      </button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => addToCart(item)}>
                        +
                      </button>
                    </div>
                    <div className="cart-item-total">
                      Rs. {(item.price * qty).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalCartCount > 0 && (
              <div className="drawer-footer">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span className="total-amount">Rs. {cartSubtotal.toFixed(2)}</span>
                </div>
                <button type="button" className="checkout-btn" onClick={handleCheckout}>
                  Confirm Canteen Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmation Toast Modal */}
      {orderConfirmed && (
        <div className="drawer-overlay" onClick={() => setOrderConfirmed(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your food is being prepared at the cafeteria counter.</p>
            <div className="token-box">
              <span className="token-label">Pickup Token Number</span>
              <span className="token-number">{orderConfirmed.token}</span>
            </div>
            <p className="confirm-summary">
              Total items: {orderConfirmed.itemCount} &bull; Bill: Rs. {orderConfirmed.total.toFixed(2)}
            </p>
            <button
              type="button"
              className="confirm-done-btn"
              onClick={() => setOrderConfirmed(null)}
            >
              Done &bull; Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Technical Footer displaying Environment Variables & Integration Info */}
      <footer className="system-footer">
        <div className="footer-container">
          <div className="footer-meta">
            <h4>SE3090 &bull; Software Engineering Frameworks</h4>
            <p>Lab Practical 11 &bull; Microservices &amp; Multi-Tier Deployment</p>
          </div>

          <div className="footer-env-card">
            <div className="env-row">
              <span className="env-label">API URL:</span>
              <code className="env-value">{API || 'Not configured'}</code>
            </div>
            <div className="env-details">
              <span>Frontend: <strong>Vercel</strong></span>
              <span>&bull;</span>
              <span>Backend: <strong>Render (ASP.NET 8)</strong></span>
              <span>&bull;</span>
              <span>Database: <strong>Supabase (PostgreSQL)</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
