import { useEffect, useState } from 'react'
import api from '../services/api'

export default function VentaPage() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Cargar productos y pre-fill desde carrito de sessionStorage
    api.get('/productos').then(res => {
      setProductos(res.data?.data || res.data || [])
    })
    const saved = JSON.parse(sessionStorage.getItem('byf_carrito') || '[]')
    if (saved.length > 0) {
      setCarrito(saved)
      sessionStorage.removeItem('byf_carrito')
    }
  }, [])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && p.stock > 0
  )

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id_producto === producto.id_producto)
      if (existe) {
        return prev.map(i =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: Math.min(i.cantidad + 1, producto.stock) }
            : i
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (id, val) => {
    setCarrito(prev => prev.map(i =>
      i.id_producto === id ? { ...i, cantidad: Math.max(1, Math.min(i.stock, Number(val))) } : i
    ))
  }

  const quitarItem = (id) => {
    setCarrito(prev => prev.filter(i => i.id_producto !== id))
  }

  const total = carrito.reduce((sum, i) => sum + parseFloat(i.precio) * i.cantidad, 0)

  const handleVenta = async () => {
    if (carrito.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const body = {
        items: carrito.map(i => ({
          producto_id: i.id_producto,
          cantidad: i.cantidad,
          precio_unitario: parseFloat(i.precio),
        })),
        total: parseFloat(total.toFixed(2)),
      }
      await api.post('/ventas', body)
      setSuccess(`✅ Venta registrada por S/ ${total.toFixed(2)}`)
      setCarrito([])
      // refrescar stock
      const res = await api.get('/productos')
      setProductos(res.data?.data || res.data || [])
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la venta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container page-section">
      <h1 className="page-title">💰 Realizar Venta</h1>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="venta-layout">
        {/* Panel productos */}
        <div className="venta-panel">
          <h2 className="panel-title">Productos disponibles</h2>
          <div className="search-box">
            <input
              id="buscar-producto"
              type="text"
              placeholder="🔍 Buscar producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="productos-lista">
            {productosFiltrados.map(p => (
              <div key={p.id_producto} className="producto-row">
                <div className="producto-row-info">
                  <span className="producto-row-nombre">{p.nombre}</span>
                  <span className="producto-row-stock">Stock: {p.stock}</span>
                </div>
                <div className="producto-row-right">
                  <span className="producto-row-precio">S/ {parseFloat(p.precio).toFixed(2)}</span>
                  <button
                    id={`agregar-${p.id_producto}`}
                    className="btn-add"
                    onClick={() => agregarAlCarrito(p)}
                  >+ Agregar</button>
                </div>
              </div>
            ))}
            {productosFiltrados.length === 0 && (
              <p className="empty-state">No hay productos disponibles.</p>
            )}
          </div>
        </div>

        {/* Carrito */}
        <div className="carrito-panel">
          <h2 className="panel-title">🛒 Carrito</h2>
          {carrito.length === 0 ? (
            <p className="empty-state">El carrito está vacío.<br />Agrega productos.</p>
          ) : (
            <>
              <div className="carrito-items">
                {carrito.map(item => (
                  <div key={item.id_producto} className="carrito-item">
                    <span className="carrito-nombre">{item.nombre}</span>
                    <div className="carrito-qty">
                      <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}>−</button>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={e => cambiarCantidad(item.id_producto, e.target.value)}
                        min={1} max={item.stock}
                      />
                      <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}>+</button>
                    </div>
                    <span className="carrito-subtotal">S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
                    <button className="btn-remove" onClick={() => quitarItem(item.id_producto)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="carrito-total">
                <span>Total:</span>
                <span className="total-amount">S/ {total.toFixed(2)}</span>
              </div>
              <button
                id="btn-confirmar-venta"
                className="btn-primary btn-full"
                onClick={handleVenta}
                disabled={loading}
              >
                {loading ? <span className="spinner-sm" /> : '✅ Confirmar Venta'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
