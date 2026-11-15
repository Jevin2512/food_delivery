import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { restaurants, dishes, cuisines } from './data/menu.js'
import LocationPicker from './components/LocationPicker.jsx'

const photo = (id, width = 720) => id.startsWith('http') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`
const money = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`
const paymentOptions = [
  { id: 'upi', label: 'UPI', detail: 'Google Pay, PhonePe, BHIM', icon: '↗' },
  { id: 'card', label: 'Credit / debit card', detail: 'Visa, Mastercard, RuPay', icon: '▣' },
  { id: 'netbanking', label: 'Netbanking', detail: 'Pay through your bank', icon: '⌂' },
  { id: 'cod', label: 'Cash on delivery', detail: 'Pay when your order arrives', icon: '₹' },
]

function PaymentInterface({ method, amount, onPaid }) {
  const [upiApp, setUpiApp] = useState('Google Pay')
  const [bank, setBank] = useState('')
  const [status, setStatus] = useState('')
  const [card, setCard] = useState({ holder: '', number: '', expiry: '', cvv: '' })

  function completeDemoPayment() {
    setStatus('Demo payment complete. No money was charged.')
    onPaid()
    if (method === 'card') setCard({ holder: '', number: '', expiry: '', cvv: '' })
  }

  if (method === 'upi') {
    const demoUpiLink = `upi://pay?pa=demo@littlebite.invalid&pn=LittleBiteDemo&am=${amount.toFixed(2)}&cu=INR&tn=DemoOrder`
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=5&data=${encodeURIComponent(demoUpiLink)}`
    return <div className="payment-interface">
      <div className="payment-interface-heading"><strong>Pay with UPI</strong><small>Scan the demo QR or choose a UPI app.</small></div>
      <div className="upi-payment-row"><img className="upi-qr" src={qrImage} alt="Demo UPI QR code. It cannot make a real payment." /><span>Demo QR only<br />{money(amount)}<br /><small>Not payable</small></span></div>
      <div className="upi-apps" aria-label="Choose a UPI app">{['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => <button type="button" key={app} className={upiApp === app ? 'active' : ''} onClick={() => { setUpiApp(app); setStatus('') }}>{app}</button>)}</div>
      <label className="payment-detail-label">UPI ID (demo only) <input autoComplete="off" placeholder="demo@upi.invalid" /></label>
      <button type="button" className="payment-continue" onClick={completeDemoPayment}>Simulate {upiApp} payment</button>
      {status && <p className="payment-interface-status" role="status">{status}</p>}
    </div>
  }

  if (method === 'card') {
    const cardDigits = card.number.replace(/\D/g, '')
    const cardReady = card.holder.trim().length > 0 && cardDigits.length >= 12 && cardDigits.length <= 19 && /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) && /^\d{3,4}$/.test(card.cvv)
    return <div className="payment-interface">
      <div className="payment-interface-heading"><strong>Card details</strong><small>Demo form only. Do not enter real card information.</small></div>
      <label className="payment-detail-label">NAME ON CARD <input autoComplete="off" value={card.holder} onChange={(event) => setCard((current) => ({ ...current, holder: event.target.value }))} placeholder="Demo cardholder" /></label>
      <label className="payment-detail-label">CARD NUMBER <input autoComplete="off" inputMode="numeric" maxLength={23} value={card.number} onChange={(event) => setCard((current) => ({ ...current, number: event.target.value }))} placeholder="0000 0000 0000 0000" /></label>
      <div className="card-detail-row"><label className="payment-detail-label">EXPIRY <input autoComplete="off" value={card.expiry} onChange={(event) => setCard((current) => ({ ...current, expiry: event.target.value }))} placeholder="MM/YY" /></label><label className="payment-detail-label">CVV <input autoComplete="off" inputMode="numeric" maxLength={4} value={card.cvv} onChange={(event) => setCard((current) => ({ ...current, cvv: event.target.value }))} placeholder="000" /></label></div>
      <button type="button" className="payment-continue" disabled={!cardReady} onClick={completeDemoPayment}>Pay {money(amount)} (demo)</button>
      {status && <p className="payment-interface-status" role="status">{status}</p>}
    </div>
  }

  if (method === 'netbanking') {
    return <div className="payment-interface">
      <div className="payment-interface-heading"><strong>Choose your bank</strong><small>You'll continue to a secure bank page when a gateway is connected.</small></div>
      <label className="payment-detail-label">SELECT BANK<select value={bank} onChange={(event) => { setBank(event.target.value); setStatus('') }}><option value="">Choose a bank</option><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option><option>Bank of Baroda</option><option>Canara Bank</option></select></label>
      <button type="button" className="payment-continue" disabled={!bank} onClick={completeDemoPayment}>Simulate {bank || 'bank'} payment</button>
      {status && <p className="payment-interface-status" role="status">{status}</p>}
    </div>
  }

  return <div className="payment-interface cod-interface"><div className="payment-interface-heading"><strong>Cash on delivery</strong><small>Pay the delivery partner when your order arrives.</small></div><span className="cod-message">Please keep the exact amount ready if possible.</span></div>
}

function App() {
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('little-bite-theme') || 'light' } catch { return 'light' }
  })
  const [activeCuisine, setActiveCuisine] = useState('Everything')
  const [ratingFilter, setRatingFilter] = useState(false)
  const [dietFilter, setDietFilter] = useState('all')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('little-bite-cart') || '{}')
      return Object.fromEntries(Object.entries(savedCart).filter(([id, quantity]) => dishes.some((dish) => dish.id === Number(id)) && quantity > 0))
    } catch { return {} }
  })
  const [favorites, setFavorites] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [confirmedPayment, setConfirmedPayment] = useState('')
  const [orderHistory, setOrderHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('little-bite-orders') || '[]') } catch { return [] }
  })
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLabel, setDeliveryLabel] = useState('Finding your location...')
  const [userLocation, setUserLocation] = useState(null)
  const locationRequestStarted = useRef(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('little-bite-theme', theme) } catch { /* Theme still applies for this visit. */ }
  }, [theme])

  const updateDeliveryAddress = useCallback((address) => {
    setDeliveryAddress(address)
    const shortAddress = address.split(',').slice(0, 2).join(',').trim()
    if (shortAddress) setDeliveryLabel(shortAddress)
  }, [])

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setDeliveryLabel('Choose delivery location')
      return
    }
    setDeliveryLabel('Finding your location...')
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const location = { lat: coords.latitude, lon: coords.longitude }
      setUserLocation(location)
      const coordinates = `Lat ${location.lat.toFixed(5)}, Lng ${location.lon.toFixed(5)}`
      updateDeliveryAddress(coordinates)
      try {
        const url = new URL('https://nominatim.openstreetmap.org/reverse')
        url.search = new URLSearchParams({ format: 'jsonv2', lat: location.lat, lon: location.lon, zoom: '18', addressdetails: '1' })
        const response = await fetch(url)
        if (!response.ok) throw new Error('Address lookup unavailable')
        const result = await response.json()
        if (result.display_name) {
          updateDeliveryAddress(result.display_name)
          const address = result.address || {}
          const area = address.suburb || address.neighbourhood || address.quarter || address.city_district
          const city = address.city || address.town || address.village || address.municipality
          setDeliveryLabel([area, city].filter(Boolean).join(', ') || result.display_name.split(',').slice(0, 2).join(', '))
        }
      } catch {
        setDeliveryLabel(coordinates)
      }
    }, () => setDeliveryLabel('Choose delivery location'), { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
  }, [updateDeliveryAddress])

  useEffect(() => {
    if (locationRequestStarted.current) return
    locationRequestStarted.current = true
    requestCurrentLocation()
  }, [requestCurrentLocation])

  useEffect(() => {
    function closeProfileMenu(event) {
      if (!profileMenuRef.current?.contains(event.target)) setShowProfile(false)
    }
    document.addEventListener('pointerdown', closeProfileMenu)
    return () => document.removeEventListener('pointerdown', closeProfileMenu)
  }, [])

  const visibleRestaurants = useMemo(() => {
    const term = search.trim().toLowerCase()
    return restaurants.filter((restaurant) => {
      const menu = dishes.filter((dish) => dish.restaurant === restaurant.name)
      const matchesTerm = !term || `${restaurant.name} ${restaurant.cuisine} ${menu.map((dish) => `${dish.name} ${dish.description}`).join(' ')}`.toLowerCase().includes(term)
      const matchesCuisine = activeCuisine === 'Everything' || restaurant.cuisine.toLowerCase().includes(activeCuisine.toLowerCase()) || (activeCuisine === 'Healthy' && restaurant.name === 'The Green Fork')
      return matchesTerm && matchesCuisine && (!ratingFilter || Number(restaurant.rating) >= 4) && (!showFavorites || favorites.includes(restaurant.id))
    })
  }, [activeCuisine, favorites, ratingFilter, search, showFavorites])

  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId)
  const visibleDishes = selectedRestaurant ? dishes.filter((dish) => {
    const term = search.trim().toLowerCase()
    const nonVeg = /\b(chicken|egg|seekh|mutton|fish|prawn|shrimp|meat|pepperoni)\b/i.test(`${dish.name} ${dish.description} ${dish.tag}`)
    const matchesDiet = dietFilter === 'all' || (dietFilter === 'nonveg' ? nonVeg : !nonVeg)
    return dish.restaurant === selectedRestaurant.name && matchesDiet && (!term || `${dish.name} ${dish.description} ${dish.tag}`.toLowerCase().includes(term))
  }) : []
  const cartEntries = Object.entries(cart).filter(([, quantity]) => quantity > 0)
  const cartCount = cartEntries.reduce((sum, [, quantity]) => sum + quantity, 0)
  const subtotal = cartEntries.reduce((sum, [id, quantity]) => sum + dishes.find((dish) => dish.id === Number(id)).price * quantity, 0)
  const deliveryFee = subtotal > 0 ? 35 : 0
  const total = subtotal + deliveryFee

  function updateCart(id, change) {
    setCart((current) => {
      const next = { ...current, [id]: Math.max(0, (current[id] || 0) + change) }
      localStorage.setItem('little-bite-cart', JSON.stringify(next))
      return next
    })
  }

  function placeOrder(event) {
    event.preventDefault()
    if (!cartCount) return
    if (paymentMethod !== 'cod' && paymentStatus !== paymentMethod) return
    const orderId = Math.random().toString(36).slice(2, 8).toUpperCase()
    const payment = paymentMethod === 'cod' ? 'Cash on delivery' : `${paymentOptions.find((option) => option.id === paymentMethod)?.label || 'UPI'} (demo)`
    const order = {
      id: orderId,
      items: cartEntries.map(([id, quantity]) => {
        const dish = dishes.find((item) => item.id === Number(id))
        return { name: dish.name, quantity, price: dish.price }
      }),
      subtotal,
      deliveryFee,
      total,
      address: deliveryAddress || deliveryLabel,
      payment,
      placedAt: new Date().toISOString(),
      status: 'Preparing',
    }
    setConfirmation(orderId)
    setConfirmedPayment(payment)
    setOrderHistory((current) => {
      const next = [order, ...current].slice(0, 20)
      try { localStorage.setItem('little-bite-orders', JSON.stringify(next)) } catch { /* Keep this session's order history if storage is unavailable. */ }
      return next
    })
    setCheckout(false)
    setCart({})
    setShowCart(false)
    setPaymentStatus('')
    localStorage.removeItem('little-bite-cart')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleFavorite(id) {
    setFavorites((current) => current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id])
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Little Bite home"><span className="brand-mark">b.</span><span className="brand-name">little<span>bite</span></span></a>
        <button className="delivery-location" type="button" onClick={() => setShowLocationPicker(true)} aria-haspopup="dialog" aria-expanded={showLocationPicker} aria-label="Choose delivery location"><span className="location-pin">⌖</span><span><small>DELIVERING TO</small><strong>{deliveryLabel} <span className="down-arrow">⌄</span></strong></span></button>
        <label className="header-search"><span aria-hidden="true">⌕</span><input aria-label="Search restaurants or dishes" placeholder="Dishes, restaurants, anything..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
        <button className={`favorite-toggle ${showFavorites ? 'is-active' : ''}`} onClick={() => { setShowFavorites((value) => !value); setSelectedRestaurantId(null) }} aria-pressed={showFavorites}>♡ <span>Saved</span></button>
        <div className="profile-menu-wrap" ref={profileMenuRef}>
          <button type="button" className="profile-button" aria-expanded={showProfile} onClick={() => setShowProfile((open) => !open)}><span className="profile-avatar">G</span><span className="profile-button-label">Profile</span><span className="profile-chevron">⌄</span></button>
          {showProfile && <div className="profile-menu" role="dialog" aria-label="Profile and account shortcuts"><div className="profile-menu-heading"><span className="profile-avatar profile-avatar-large">G</span><span><strong>Guest profile</strong><small>Welcome to Little Bite</small></span></div><div className="profile-menu-section"><small>DELIVERY ADDRESS</small><strong>{deliveryLabel}</strong><button onClick={() => { setShowProfile(false); setShowLocationPicker(true) }}>Change address <span>→</span></button></div><div className="profile-menu-section"><small>YOUR ORDER</small><strong>{cartCount} {cartCount === 1 ? 'item' : 'items'} · {money(total)}</strong><button onClick={() => { setShowProfile(false); setShowCart(true) }}>View cart and checkout <span>→</span></button><div className="profile-theme-row"><span>Appearance</span><button className="theme-toggle profile-theme-toggle" type="button" aria-pressed={theme === "dark"} onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}><span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span><span className="theme-toggle-label">{theme === "dark" ? "Light mode" : "Dark mode"}</span></button></div></div><div className="profile-menu-section order-history-section"><small>ORDER HISTORY</small>{orderHistory.length ? <><button type="button" className="clear-order-history" onClick={() => { setOrderHistory([]); setShowOrderHistory(false); localStorage.removeItem('little-bite-orders') }}>Clear history</button><button type="button" aria-expanded={showOrderHistory} onClick={() => setShowOrderHistory((visible) => !visible)}>{showOrderHistory ? 'Hide' : 'View'} {orderHistory.length} {orderHistory.length === 1 ? 'past order' : 'past orders'} <span>{showOrderHistory ? '−' : '+'}</span></button>{showOrderHistory && <div className="order-history-list">{orderHistory.map((order) => <article className="order-summary-card" key={order.id}><div className="order-summary-heading"><strong>Order #{order.id}</strong><span>{order.status}</span></div><small>{new Date(order.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small><p>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</p><div className="order-summary-total"><span>{order.payment}</span><strong>{money(order.total)}</strong></div></article>)}</div>}</> : <span className="order-history-empty">Your completed orders will appear here.</span>}</div></div>}
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEIGHBORHOOD, DELIVERED</div><h1>Good food.<br /><span>Good life.</span></h1><p>The spots you love, and the ones you're about to.<br />Brought right to your door.</p><div className="hero-note"><span className="note-avatars">☺︎  ☺︎  ☺︎</span><span><strong>Your neighbors have good taste.</strong><br />Join 2,400+ happy foodies</span></div></div>
          <div className="hero-bottom"><div className="open-pill"><span /> {restaurants.length} NEIGHBORHOOD RESTAURANTS</div><span className="hero-bottom-copy">Good things are cooking around the corner.</span></div>
        </section>

        {confirmation && <section className="order-confirmation" aria-live="polite"><span className="confirmation-icon">✓</span><div><strong>Order #{confirmation} is in the oven!</strong><span>We'll deliver to {deliveryAddress || 'your place'} in about 25–35 minutes. Payment: {confirmedPayment}.</span></div><button onClick={() => setConfirmation('')} aria-label="Dismiss confirmation">×</button></section>}

        <section className="browse-layout">
          <div className="browse-main">
            <div className="section-heading"><div><div className="eyebrow section-eyebrow">A LITTLE SOMETHING FOR EVERYONE</div><h2>What sounds good?</h2></div><span className="neighborhood-label">MADE AROUND THE CORNER <span>↗</span></span></div>
            <div className="category-list" aria-label="Filter by cuisine">{cuisines.map((cuisine) => <button key={cuisine.label} className={`category-chip ${activeCuisine === cuisine.label ? 'selected' : ''}`} onClick={() => { setActiveCuisine(cuisine.label); setSelectedRestaurantId(null) }}><span>{cuisine.emoji}</span>{cuisine.label}</button>)}</div>
            {!selectedRestaurant && <div className="rating-filter-row"><button type="button" className={`rating-filter-button ${ratingFilter ? 'selected' : ''}`} aria-pressed={ratingFilter} onClick={() => setRatingFilter((active) => !active)}>★ 4.0+ rating</button><span>Show restaurants rated 4.0 or higher</span></div>}

            {selectedRestaurant ? <>
              <button className="menu-back" onClick={() => setSelectedRestaurantId(null)}>← All restaurants</button>
              <div className="restaurant-heading menu-heading"><div><h2>{selectedRestaurant.name}</h2><p>{selectedRestaurant.cuisine} <span>·</span> ★ {selectedRestaurant.rating} <span>·</span> {selectedRestaurant.time}</p></div><span>{visibleDishes.length} DISHES</span></div>
              <p className="restaurant-description">{selectedRestaurant.description}</p>
              <div className="diet-filter-row" aria-label="Filter dishes by dietary preference"><span>SHOW:</span>{[{ id: 'all', label: 'All' }, { id: 'veg', label: 'Veg', symbol: '●' }, { id: 'nonveg', label: 'Non-veg', symbol: '●' }].map((option) => <button key={option.id} type="button" className={`diet-filter-button ${dietFilter === option.id ? 'selected' : ''} ${option.id}`} aria-pressed={dietFilter === option.id} onClick={() => setDietFilter(option.id)}>{option.symbol && <span aria-hidden="true">{option.symbol}</span>}{option.label}</button>)}</div>
              {visibleDishes.length ? <div className="dish-menu-grid">{visibleDishes.map((dish) => { const quantity = cart[dish.id] || 0; return <article className="menu-dish-card" key={dish.id}><img src={photo(dish.image)} alt={dish.name} loading="lazy" /><div className="menu-dish-info"><span className="dish-tag">{dish.tag}</span><h3>{dish.emoji} {dish.name}</h3><p>{dish.description}</p><div className="menu-dish-bottom"><strong>{money(dish.price)}</strong>{quantity ? <div className="quantity-control"><button onClick={() => updateCart(dish.id, -1)} aria-label={`Remove one ${dish.name}`}>−</button><span>{quantity}</span><button onClick={() => updateCart(dish.id, 1)} aria-label={`Add one ${dish.name}`}>+</button></div> : <button className="menu-add-button" onClick={() => updateCart(dish.id, 1)}>Add <span>+</span></button>}</div></div></article> })}</div> : <div className="empty-results"><span>🥡</span><h3>No matching dishes.</h3><p>Try another search or clear the search box to see the full menu.</p></div>}
            </> : <>
              <div className="restaurant-heading"><h2>{showFavorites ? 'Your saved restaurants' : search ? `Good finds for “${search}”` : 'Restaurants near you'}</h2><span>{visibleRestaurants.length} RESTAURANTS <i>·</i> {dishes.filter((dish) => visibleRestaurants.some((restaurant) => restaurant.name === dish.restaurant)).length} DISHES</span></div>
              {visibleRestaurants.length ? <div className="restaurant-grid">{visibleRestaurants.map((restaurant) => { const menuCount = dishes.filter((dish) => dish.restaurant === restaurant.name).length; return <article className="restaurant-card" key={restaurant.id}><div className="restaurant-image"><img src={photo(restaurant.image)} alt={`${restaurant.name} cuisine`} loading="lazy" /><button className={`heart-button ${favorites.includes(restaurant.id) ? 'hearted' : ''}`} aria-label={`${favorites.includes(restaurant.id) ? 'Remove' : 'Save'} ${restaurant.name}`} onClick={() => toggleFavorite(restaurant.id)}>{favorites.includes(restaurant.id) ? '♥' : '♡'}</button></div><div className="restaurant-info"><div className="restaurant-title"><h3>{restaurant.name}</h3><span className="rating-chip">★ {restaurant.rating}</span></div><p>{restaurant.cuisine}</p><p className="restaurant-card-description">{restaurant.description}</p><div className="restaurant-card-footer"><span>◷ {restaurant.time} <i>·</i> {menuCount} dishes</span><button className="add-button" onClick={() => setSelectedRestaurantId(restaurant.id)}>View menu <span>→</span></button></div></div></article> })}</div> : <div className="empty-results"><span>🥡</span><h3>No restaurants found just yet.</h3><p>Try a different search or explore everything nearby.</p><button onClick={() => { setSearch(''); setActiveCuisine('Everything'); setRatingFilter(false); setShowFavorites(false) }}>Show me everything</button></div>}
            </>}

            <section className="little-note"><span className="note-sun">✳</span><div><strong>Small spots. Big heart.</strong><p>Every order supports a local neighborhood kitchen. Thanks for eating local.</p></div><span className="note-arrow">↗</span></section>
          </div>

          {showCart && <><button className="cart-backdrop" aria-label="Close your bag" onClick={() => { setShowCart(false); setCheckout(false) }} /><aside className="cart-panel is-open" id="cart"><div className="cart-heading"><div><span className="eyebrow section-eyebrow">{checkout ? 'READY WHEN YOU ARE' : 'GOOD THINGS INSIDE'}</span><h2>{checkout ? 'Checkout' : 'Your bag'} <span>({cartCount})</span></h2></div><button className="cart-close" onClick={() => { setShowCart(false); setCheckout(false) }} aria-label="Close your bag">×</button></div>
            {checkout && cartEntries.length ? <form className="checkout-in-cart" onSubmit={placeOrder}><button className="checkout-back-link" type="button" onClick={() => setCheckout(false)}>← Back to your bag</button><p className="modal-intro">Review your order and delivery details.</p><div className="checkout-cart-summary"><strong>Order summary</strong>{cartEntries.map(([id, quantity]) => { const dish = dishes.find((item) => item.id === Number(id)); return <div className="checkout-summary-line" key={id}><span>{quantity} × {dish.name}</span><strong>{money(dish.price * quantity)}</strong></div> })}<div className="checkout-summary-line"><span>Delivery</span><strong>{money(deliveryFee)}</strong></div><div className="checkout-summary-line checkout-summary-total"><span>Total</span><strong>{money(total)}</strong></div></div><label className="form-label">DELIVERY ADDRESS<input required value={deliveryAddress} onChange={(event) => updateDeliveryAddress(event.target.value)} placeholder="e.g. 12 MG Road, Bengaluru, Karnataka" /></label><LocationPicker initialLocation={userLocation} onLocationChange={setUserLocation} onAddressChange={updateDeliveryAddress} /><label className="form-label">NAME FOR THE ORDER<input required placeholder="Your name" /></label><fieldset className="payment-fieldset"><legend>PAYMENT METHOD</legend><div className="payment-methods">{paymentOptions.map((option) => <label key={option.id} className={`payment-option ${paymentMethod === option.id ? 'selected' : ''}`}><input type="radio" name="paymentMethod" value={option.id} checked={paymentMethod === option.id} onChange={() => { setPaymentMethod(option.id); setPaymentStatus('') }} /><span className="payment-icon" aria-hidden="true">{option.icon}</span><span className="payment-copy"><strong>{option.label}</strong><small>{option.detail}</small></span></label>)}</div><PaymentInterface key={paymentMethod} method={paymentMethod} amount={total} onPaid={() => setPaymentStatus(paymentMethod)} /><p className="payment-demo-note">{paymentMethod === 'cod' ? 'Pay the delivery partner when your order arrives.' : 'Demo only: no money is transferred. Card details stay temporary and are never saved in browser storage.'}</p></fieldset><button className="checkout-button" type="submit" disabled={paymentMethod !== 'cod' && paymentStatus !== paymentMethod}>{paymentMethod !== 'cod' && paymentStatus !== paymentMethod ? 'Complete demo payment first' : 'Place my order'} <span>→</span></button><p className="checkout-caption">{paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'DEMO ONLY · NO PAYMENT WILL BE CHARGED'}</p></form> : cartEntries.length ? <><div className="cart-items">{cartEntries.map(([id, quantity]) => { const dish = dishes.find((item) => item.id === Number(id)); return <div className="cart-item" key={id}><img src={photo(dish.image, 160)} alt="" /><div className="cart-item-info"><strong>{dish.name}</strong><small>{dish.restaurant}</small><div className="quantity-control"><button onClick={() => updateCart(dish.id, -1)} aria-label={`Remove one ${dish.name}`}>−</button><span>{quantity}</span><button onClick={() => updateCart(dish.id, 1)} aria-label={`Add one ${dish.name}`}>+</button></div></div><strong className="line-price">{money(dish.price * quantity)}</strong></div> })}</div><div className="delivery-note"><span>✳</span> Made with love, delivered with care.</div><div className="bill"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Delivery</span><strong>{money(deliveryFee)}</strong></div><div className="bill-total"><span>Total</span><strong>{money(total)}</strong></div></div><button className="checkout-button" onClick={() => setCheckout(true)}>Head to checkout <span>→</span></button><p className="checkout-caption">NO SURPRISE FEES. PINKY PROMISE.</p></> : <div className="empty-cart"><span className="empty-bag">♡</span><h3>Your bag's a little quiet.</h3><p>Go on, find something delicious.</p><button className="empty-cart-link" onClick={() => setShowCart(false)}>Explore the menu <span>↗</span></button><div className="empty-cart-divider" /><div className="cart-perk"><span>✳</span><p><strong>Made with love.</strong><br />From your local favorites.</p></div><div className="cart-perk"><span>♧</span><p><strong>On its way.</strong><br />Hot, fresh, and at your door.</p></div></div>}
            {!checkout && <div className="support-note">NEED A HAND? <a href="mailto:hello@littlebite.example">Say hello ↗</a></div>}
          </aside></>}
        </section>
        {cartCount > 0 && <div className="cart-toast" role="status" aria-live="polite"><span className="cart-toast-icon">🛍</span><span className="cart-toast-summary"><strong>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</strong><small>Total {money(total)}</small></span><button className="cart-toast-review" onClick={() => { setShowProfile(false); setShowCart(true) }}>View cart</button></div>}
        <footer className="page-footer"><a className="brand" href="#home"><span className="brand-mark">b.</span><span className="brand-name">little<span>bite</span></span></a><span>GOOD FOOD BRINGS US TOGETHER. © 2025 LITTLE BITE.</span><a href="#home">Made for the neighborhood <span>♡</span></a></footer>
      </main>

      {showLocationPicker && <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setShowLocationPicker(false) }}><section className="location-modal" role="dialog" aria-modal="true" aria-labelledby="location-modal-title"><button className="modal-close" type="button" onClick={() => setShowLocationPicker(false)} aria-label="Close location picker">×</button><div className="eyebrow section-eyebrow">DELIVERY LOCATION</div><h2 id="location-modal-title">Where should we deliver?</h2><p className="modal-intro">Pin your exact spot or use your current location.</p><label className="form-label">DELIVERY ADDRESS<input autoFocus value={deliveryAddress} onChange={(event) => updateDeliveryAddress(event.target.value)} placeholder="Street, area, city" /></label><LocationPicker initialLocation={userLocation} onLocationChange={setUserLocation} onAddressChange={updateDeliveryAddress} /><button className="checkout-button location-done" type="button" onClick={() => setShowLocationPicker(false)}>Use this address <span>→</span></button></section></div>}

    </div>
  )
}

export default App
