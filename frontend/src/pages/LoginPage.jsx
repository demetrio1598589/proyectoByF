import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/login', form)
      const { token, usuario } = res.data
      login(usuario, token)
      // Redirigir según rol
      if (usuario.rol === 'admin') navigate('/usuarios')
      else if (usuario.rol === 'cajero') navigate('/venta')
      else if (usuario.rol === 'panadero') navigate('/produccion')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <span className="logo-icon" style={{ fontSize: '2.5rem' }}>🥖</span>
          <h1 className="login-title">Panadería ByF</h1>
          <p className="login-subtitle">Ingresa a tu cuenta</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form" id="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <span className="spinner-sm" /> : 'Ingresar'}
          </button>
        </form>

        <div className="login-hint">
          <p>Usuarios de prueba:</p>
          <div className="hint-grid">
            <span>admin → <code>juan@gmail.com</code></span>
            <span>cajero → <code>maria@gmail.com</code></span>
            <span>panadero → <code>carlos@gmail.com</code></span>
            <span>password → <code>123456</code></span>
          </div>
        </div>
      </div>
    </div>
  )
}
