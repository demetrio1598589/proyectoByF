import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const TIPO_EMOJI = {
  pan: '🍞',
  pastel: '🎂',
  bebida: '☕',
  otros: '🛒',
}

const TIPO_LABEL = {
  pan: 'Pan',
  pastel: 'Pastel',
  bebida: 'Bebida',
  otros: 'Otros',
}

export default function Home() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    api.get('/productos')
      .then(res => {
        setProductos(res.data?.data || res.data || [])
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudieron cargar los productos.')
        setLoading(false)
      })
  }, [])

  const tipos = ['todos', ...new Set(productos.map(p => p.tipo))]
  const filtrados = filtro === 'todos' ? productos : productos.filter(p => p.tipo === filtro)

  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-tagline">Bienvenidos a</p>
          <h1 className="hero-title">Panadería <span>ByF</span></h1>
          <p className="hero-subtitle">Artesanal · Fresco · Diario</p>
          <a href="#productos" className="btn-hero">Ver nuestros productos</a>
        </div>
        <div className="hero-deco">
          <span className="deco-emoji">🥐</span>
          <span className="deco-emoji delay-1">🍞</span>
          <span className="deco-emoji delay-2">🎂</span>
        </div>
      </section>

      {/* Catálogo */}
      <section className="catalog-section" id="productos">
        <div className="container">
          <h2 className="section-title">Nuestros Productos</h2>

          {/* Filtros */}
          <div className="filter-bar" role="group" aria-label="Filtrar por tipo">
            {tipos.map(t => (
              <button
                key={t}
                id={`filter-${t}`}
                className={`filter-btn ${filtro === t ? 'active' : ''}`}
                onClick={() => setFiltro(t)}
              >
                {t === 'todos' ? '🛍️ Todos' : `${TIPO_EMOJI[t] || '🛒'} ${TIPO_LABEL[t] || t}`}
              </button>
            ))}
          </div>

          {loading && (
            <div className="state-center">
              <div className="spinner" />
              <p>Cargando productos...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {!loading && !error && filtrados.length === 0 && (
            <div className="state-center">
              <p>No hay productos en esta categoría.</p>
            </div>
          )}

          <div className="products-grid">
            {filtrados.map(producto => (
              <Link
                to={`/productos/${producto.id_producto}`}
                key={producto.id_producto}
                className="product-card"
                id={`product-${producto.id_producto}`}
              >
                <div className="product-emoji">{TIPO_EMOJI[producto.tipo] || '🛒'}</div>
                <div className="product-info">
                  <span className="product-type-tag">{TIPO_LABEL[producto.tipo] || producto.tipo}</span>
                  <h3 className="product-name">{producto.nombre}</h3>
                  <p className="product-desc">{producto.descripcion}</p>
                  <div className="product-footer">
                    <span className="product-price">S/ {parseFloat(producto.precio).toFixed(2)}</span>
                    <span className={`stock-badge ${producto.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                      {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
