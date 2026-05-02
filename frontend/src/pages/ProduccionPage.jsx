import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const EMPTY_FORM = {
  producto_id: '',
  cantidad_producida: '',
  fecha: new Date().toISOString().split('T')[0],
  observaciones: '',
}

export default function ProduccionPage() {
  const { user } = useAuth()
  const [productos, setProductos] = useState([])
  const [producciones, setProducciones] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const cargarDatos = () => {
    setListLoading(true)
    Promise.all([
      api.get('/productos'),
      api.get('/produccion/mis-producciones'),
    ]).then(([pRes, prodRes]) => {
      setProductos(pRes.data?.data || pRes.data || [])
      setProducciones(prodRes.data?.data || prodRes.data || [])
    }).finally(() => setListLoading(false))
  }

  useEffect(() => { cargarDatos() }, [])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/produccion', {
        producto_id: parseInt(form.producto_id),
        cantidad_producida: parseInt(form.cantidad_producida),
        fecha: form.fecha,
        observaciones: form.observaciones,
      })
      setSuccess('✅ Producción registrada exitosamente')
      setForm(EMPTY_FORM)
      cargarDatos()
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la producción.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container page-section">
      <h1 className="page-title">🏭 Registrar Producción</h1>
      <p className="page-subtitle">Hola, <strong>{user?.nombre}</strong>. Registra los productos que produjiste hoy.</p>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="produccion-layout">
        {/* Formulario */}
        <div className="produccion-form-card">
          <h2 className="panel-title">Nueva producción</h2>
          <form id="form-produccion" onSubmit={handleSubmit} className="form-produccion">
            <div className="form-group">
              <label htmlFor="prod-producto">Producto</label>
              <select
                id="prod-producto"
                name="producto_id"
                value={form.producto_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map(p => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre} ({p.tipo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="prod-cantidad">Cantidad producida</label>
                <input
                  id="prod-cantidad"
                  type="number"
                  name="cantidad_producida"
                  value={form.cantidad_producida}
                  onChange={handleChange}
                  min={1}
                  required
                  placeholder="Ej: 200"
                />
              </div>
              <div className="form-group">
                <label htmlFor="prod-fecha">Fecha</label>
                <input
                  id="prod-fecha"
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prod-obs">Observaciones</label>
              <textarea
                id="prod-obs"
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                rows={3}
                placeholder="Notas del turno, incidencias, etc."
              />
            </div>

            <button
              id="btn-registrar-produccion"
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading ? <span className="spinner-sm" /> : '🏭 Registrar producción'}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="produccion-historial">
          <h2 className="panel-title">Mis producciones recientes</h2>
          {listLoading ? (
            <div className="state-center"><div className="spinner" /></div>
          ) : producciones.length === 0 ? (
            <p className="empty-state">Aún no tienes registros de producción.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table" id="tabla-producciones">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Fecha</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {producciones.map(p => (
                    <tr key={p.id_produccion}>
                      <td>{p.nombre_producto || p.producto?.nombre || `#${p.producto_id}`}</td>
                      <td><strong>{p.cantidad_producida}</strong></td>
                      <td>{new Date(p.fecha + 'T00:00:00').toLocaleDateString()}</td>
                      <td className="obs-cell">{p.observaciones || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
