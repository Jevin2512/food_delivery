import { useEffect, useMemo, useRef, useState } from 'react'
import './LocationPicker.css'

const TILE_SIZE = 256
const INITIAL_LOCATION = { lat: 12.9784, lon: 77.6408 }

function toWorld({ lat, lon }, zoom) {
  const scale = TILE_SIZE * (2 ** zoom)
  const boundedLat = Math.max(-85.0511, Math.min(85.0511, lat))
  const sin = Math.sin((boundedLat * Math.PI) / 180)
  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  }
}

function fromWorld({ x, y }, zoom) {
  const scale = TILE_SIZE * (2 ** zoom)
  return {
    lon: (x / scale) * 360 - 180,
    lat: (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale))) * 180) / Math.PI,
  }
}

function TileMap({ location, zoom, onSelect }) {
  const stageRef = useRef(null)
  const dragRef = useRef(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const world = useMemo(() => toWorld(location, zoom), [location, zoom])
  const tiles = useMemo(() => {
    const centerX = Math.floor(world.x / TILE_SIZE)
    const centerY = Math.floor(world.y / TILE_SIZE)
    const maxTile = 2 ** zoom
    return [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => {
      const x = (centerX + dx + maxTile) % maxTile
      const y = Math.max(0, Math.min(maxTile - 1, centerY + dy))
      return {
        key: `${zoom}/${x}/${y}`,
        url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
        left: (centerX + dx) * TILE_SIZE - world.x,
        top: (centerY + dy) * TILE_SIZE - world.y,
      }
    }))
  }, [world, zoom])

  function handlePointerDown(event) {
    if (event.button !== 0) return
    dragRef.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    if (!dragRef.current) return
    setDragOffset({
      x: Math.max(-150, Math.min(150, event.clientX - dragRef.current.x)),
      y: Math.max(-150, Math.min(150, event.clientY - dragRef.current.y)),
    })
  }

  function handlePointerUp(event) {
    if (!dragRef.current || !stageRef.current) return
    const bounds = stageRef.current.getBoundingClientRect()
    const dx = Math.max(-150, Math.min(150, event.clientX - dragRef.current.x))
    const dy = Math.max(-150, Math.min(150, event.clientY - dragRef.current.y))
    const moved = Math.abs(dx) > 5 || Math.abs(dy) > 5
    const nextWorld = moved
      ? { x: world.x - dx, y: world.y - dy }
      : { x: world.x + event.clientX - bounds.left - bounds.width / 2, y: world.y + event.clientY - bounds.top - bounds.height / 2 }
    dragRef.current = null
    setDragOffset({ x: 0, y: 0 })
    onSelect(fromWorld(nextWorld, zoom))
  }

  return (
    <div
      className="map-stage"
      ref={stageRef}
      role="application"
      aria-label="Map. Drag or tap to choose your delivery location."
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragRef.current = null; setDragOffset({ x: 0, y: 0 }) }}
    >
      <div className="map-tiles" style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}>
        {tiles.map((tile) => <img key={tile.key} className="map-tile" src={tile.url} alt="" draggable="false" style={{ left: `calc(50% + ${tile.left}px)`, top: `calc(50% + ${tile.top}px)` }} />)}
      </div>
      <span className="map-pin" aria-hidden="true"><span /></span>
      <span className="map-attribution"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></span>
    </div>
  )
}

export default function LocationPicker({ initialLocation, onLocationChange, onAddressChange }) {
  const [location, setLocation] = useState(initialLocation || INITIAL_LOCATION)
  const [zoom, setZoom] = useState(15)
  const [status, setStatus] = useState('Move the map or tap to place your pin.')
  const [locating, setLocating] = useState(false)
  const lookupTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(lookupTimer.current), [])

  function resolveAddress(nextLocation) {
    window.clearTimeout(lookupTimer.current)
    onAddressChange(`Lat ${nextLocation.lat.toFixed(5)}, Lng ${nextLocation.lon.toFixed(5)}`)
    setStatus('Finding the street address…')
    lookupTimer.current = window.setTimeout(async () => {
      try {
        const url = new URL('https://nominatim.openstreetmap.org/reverse')
        url.search = new URLSearchParams({ format: 'jsonv2', lat: nextLocation.lat, lon: nextLocation.lon, zoom: '18', addressdetails: '1' })
        const response = await fetch(url)
        if (!response.ok) throw new Error('Address lookup unavailable')
        const result = await response.json()
        if (result.display_name) {
          onAddressChange(result.display_name)
          setStatus('Delivery address updated.')
        } else {
          setStatus('Pin selected. You can edit the address above.')
        }
      } catch {
        setStatus('Pin selected. Enter or edit the address above.')
      }
    }, 1100)
  }

  function selectLocation(nextLocation) {
    setLocation(nextLocation)
    onLocationChange?.(nextLocation)
    resolveAddress(nextLocation)
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus('Location sharing is not available in this browser.')
      return
    }
    setLocating(true)
    setStatus('Finding your location…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLocation = { lat: coords.latitude, lon: coords.longitude }
        setLocation(nextLocation)
        onLocationChange?.(nextLocation)
        setZoom(16)
        setLocating(false)
        resolveAddress(nextLocation)
      },
      () => {
        setLocating(false)
        setStatus('Could not access your location. Check browser permissions and try again.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  return (
    <section className="location-picker" aria-label="Choose delivery location">
      <div className="location-picker-toolbar">
        <span>DELIVERY PIN</span>
        <button type="button" onClick={useMyLocation} disabled={locating}>{locating ? 'Locating…' : '◎ Use my location'}</button>
      </div>
      <TileMap location={location} zoom={zoom} onSelect={selectLocation} />
      <div className="location-picker-footer">
        <span aria-live="polite">{status}</span>
        <div className="map-zoom-controls" aria-label="Map zoom controls">
          <button type="button" aria-label="Zoom in" onPointerDown={(event) => event.stopPropagation()} onClick={() => setZoom((value) => Math.min(19, value + 1))}>+</button>
          <button type="button" aria-label="Zoom out" onPointerDown={(event) => event.stopPropagation()} onClick={() => setZoom((value) => Math.max(11, value - 1))}>−</button>
        </div>
      </div>
    </section>
  )
}
