import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROL_LABELS = {
  admin: 'Administrador',
  cajero: 'Cajero',
  panadero: 'Panadero',
}

const ROL_BADGE_CLASS = {
  admin: 'badge badge-admin',
  cajero: 'badge badge-cajero',
  panadero: 'badge badge-panadero',
}

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🥖</span>
          <span className="logo-text">Panadería <strong>ByF</strong></span>
        </Link>

        {/* Hamburger (mobile) */}
        <button
          id="menu-toggle"
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>

        {/* Nav */}
        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
            Productos
          </Link>

          {/* Links por rol */}
          {user?.rol === 'cajero' && (
            <Link to="/venta" className={isActive('/venta')} onClick={() => setMenuOpen(false)}>
              💰 Realizar Venta
            </Link>
          )}
          {user?.rol === 'admin' && (
            <>
              <Link to="/usuarios" className={isActive('/usuarios')} onClick={() => setMenuOpen(false)}>
                👥 Usuarios
              </Link>
              <Link to="/venta" className={isActive('/venta')} onClick={() => setMenuOpen(false)}>
                💰 Realizar Venta
              </Link>
            </>
          )}
          {user?.rol === 'panadero' && (
            <Link to="/produccion" className={isActive('/produccion')} onClick={() => setMenuOpen(false)}>
              🏭 Mi Producción
            </Link>
          )}

          {/* Auth */}
          {!user ? (
            <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>
              Iniciar Sesión
            </Link>
          ) : (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">{user.nombre?.[0]}{user.apellido?.[0]}</div>
                <div className="user-details">
                  <span className="user-name">{user.nombre} {user.apellido}</span>
                  <span className={ROL_BADGE_CLASS[user.rol]}>{ROL_LABELS[user.rol]}</span>
                </div>
              </div>
              <button id="btn-logout" className="btn-logout" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
