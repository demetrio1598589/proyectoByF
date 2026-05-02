import { useEffect, useState } from 'react'
import api from '../services/api'

const ROLES = ['admin', 'cajero', 'panadero']
const EMPTY_FORM = { nombre: '', apellido: '', email: '', dni: '', password: '', rol: 'cajero' }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null) // null = crear, obj = editar
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)

  const cargarUsuarios = () => {
    setLoading(true)
    api.get('/usuarios')
      .then(res => setUsuarios(res.data?.data || res.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarUsuarios() }, [])

  const abrirCrear = () => {
    setEditando(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setModal(true)
  }

  const abrirEditar = (u) => {
    setEditando(u)
    setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, dni: u.dni, password: '', rol: u.rol })
    setFormError(null)
    setModal(true)
  }

  const cerrarModal = () => {
    setModal(false)
    setEditando(null)
    setFormError(null)
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    try {
      const payload = { ...form }
      if (editando && !payload.password) delete payload.password
      if (editando) {
        await api.put(`/usuarios/${editando.id_usuario}`, payload)
        showToast('✅ Usuario actualizado correctamente')
      } else {
        await api.post('/usuarios', payload)
        showToast('✅ Usuario creado correctamente')
      }
      cerrarModal()
      cargarUsuarios()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar el usuario.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    try {
      await api.delete(`/usuarios/${id}`)
      showToast('🗑️ Usuario eliminado')
      cargarUsuarios()
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Error al eliminar'), 'error')
    }
    setConfirmarEliminar(null)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const ROL_BADGE = { admin: 'badge badge-admin', cajero: 'badge badge-cajero', panadero: 'badge badge-panadero' }

  return (
    <div className="container page-section">
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header-row">
        <h1 className="page-title">👥 Gestión de Usuarios</h1>
        <button id="btn-nuevo-usuario" className="btn-primary" onClick={abrirCrear}>
          + Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="state-center"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table" id="tabla-usuarios">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>DNI</th>
                <th>Rol</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.dni}</td>
                  <td><span className={ROL_BADGE[u.rol] || 'badge'}>{u.rol}</span></td>
                  <td>{new Date(u.fecha_creacion).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button
                      id={`btn-editar-${u.id_usuario}`}
                      className="btn-icon btn-edit"
                      onClick={() => abrirEditar(u)}
                    >✏️</button>
                    <button
                      id={`btn-eliminar-${u.id_usuario}`}
                      className="btn-icon btn-delete"
                      onClick={() => setConfirmarEliminar(u)}
                    >🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleSubmit} id="form-usuario" className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="u-nombre">Nombre</label>
                  <input id="u-nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="u-apellido">Apellido</label>
                  <input id="u-apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="u-email">Email</label>
                <input id="u-email" type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="u-dni">DNI</label>
                  <input id="u-dni" name="dni" value={form.dni} onChange={handleChange} maxLength={8} required />
                </div>
                <div className="form-group">
                  <label htmlFor="u-rol">Rol</label>
                  <select id="u-rol" name="rol" value={form.rol} onChange={handleChange}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="u-password">
                  Contraseña {editando && <span className="hint-text">(dejar vacío para no cambiar)</span>}
                </label>
                <input
                  id="u-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editando}
                  autoComplete="new-password"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                <button id="btn-guardar-usuario" type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="spinner-sm" /> : editando ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmarEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmarEliminar(null)}>
          <div className="modal-card modal-sm" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">⚠️ Confirmar eliminación</h2>
            <p>¿Eliminar a <strong>{confirmarEliminar.nombre} {confirmarEliminar.apellido}</strong>?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmarEliminar(null)}>Cancelar</button>
              <button id="btn-confirmar-eliminar" className="btn-danger" onClick={() => handleEliminar(confirmarEliminar.id_usuario)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
