import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const TIPO_EMOJI = {
  pan: '🍞', pastel: '🎂', bebida: '☕', otros: '🛒',
}

export default function ProductoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(res => {
        setProducto(res.data?.data || res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Producto no encontrado.')
        setLoading(false)
      })
  }, [id])

  const handleComprar = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // Guardar en sessionStorage para pre-llenar venta
    const carrito = JSON.parse(sessionStorage.getItem('byf_carrito') || '[]')
    const existe = carrito.find(i => i.id_producto === producto.id_producto)
    if (existe) {
      existe.cantidad += cantidad
    } else {
      carrito.push({ ...producto, cantidad })
    }
    sessionStorage.setItem('byf_carrito', JSON.stringify(carrito))
    setToast('¡Producto agregado al carrito!')
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) return (
    <div className="state-center" style={{ minHeight: '60vh' }}>
      <div className="spinner" /><p>Cargando producto...</p>
    </div>
  )

  if (error) return (
    <div className="container" style={{ marginTop: '4rem' }}>
      <div className="alert alert-error">{error}</div>
      <button className="btn-secondary" onClick={() => navigate('/')}>← Volver</button>
    </div>
  )

  return (
    <div className="container detalle-container">
      {toast && <div className="toast">{toast}</div>}

      <button className="btn-back" onClick={() => navigate('/')}>← Volver al catálogo</button>

      <div className="detalle-card">
        <div className="detalle-emoji-col">
          <div className="detalle-emoji">{TIPO_EMOJI[producto.tipo] || '🛒'}</div>
          <span className="product-type-tag">{producto.tipo}</span>
        </div>

        <div className="detalle-info">
          <h1 className="detalle-title">{producto.nombre}</h1>
          <p className="detalle-desc">{producto.descripcion}</p>

          {/* Detalles extra */}
          {producto.detalle && (
            <div className="detalle-meta-grid">
              {producto.detalle.ingredientes && (
                <div className="meta-item">
                  <span className="meta-label">🌾 Ingredientes</span>
                  <span className="meta-value">{producto.detalle.ingredientes}</span>
                </div>
              )}
              {producto.detalle.peso && (
                <div className="meta-item">
                  <span className="meta-label">⚖️ Peso</span>
                  <span className="meta-value">{producto.detalle.peso}</span>
                </div>
              )}
              {producto.detalle.calorias && (
                <div className="meta-item">
                  <span className="meta-label">🔥 Calorías</span>
                  <span className="meta-value">{producto.detalle.calorias} kcal</span>
                </div>
              )}
              {producto.detalle.fecha_vencimiento && (
                <div className="meta-item">
                  <span className="meta-label">📅 Vence</span>
                  <span className="meta-value">{producto.detalle.fecha_vencimiento}</span>
                </div>
              )}
            </div>
          )}

          <div className="detalle-buy">
            <div className="price-big">S/ {parseFloat(producto.precio).toFixed(2)}</div>
            <span className={`stock-badge ${producto.stock > 0 ? 'in-stock' : 'out-stock'}`}>
              {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
            </span>

            {producto.stock > 0 && (
              <div className="qty-row">
                <label htmlFor="cantidad-input">Cantidad:</label>
                <div className="qty-control">
                  <button onClick={() => setCantidad(q => Math.max(1, q - 1))}>−</button>
                  <input
                    id="cantidad-input"
                    type="number"
                    value={cantidad}
                    min={1}
                    max={producto.stock}
                    onChange={e => setCantidad(Math.max(1, Math.min(producto.stock, Number(e.target.value))))}
                  />
                  <button onClick={() => setCantidad(q => Math.min(producto.stock, q + 1))}>+</button>
                </div>
              </div>
            )}

            <button
              id="btn-comprar"
              className="btn-primary btn-comprar"
              onClick={handleComprar}
              disabled={producto.stock === 0}
            >
              {!user ? '🔒 Iniciar sesión para comprar' : '🛒 Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
