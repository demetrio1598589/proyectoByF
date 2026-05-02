import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductoDetalle from './pages/ProductoDetalle'
import LoginPage from './pages/LoginPage'
import VentaPage from './pages/VentaPage'
import UsuariosPage from './pages/UsuariosPage'
import ProduccionPage from './pages/ProduccionPage'
import './index.css'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos/:id" element={<ProductoDetalle />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/venta"
            element={
              <PrivateRoute roles={['cajero', 'admin']}>
                <VentaPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute roles={['admin']}>
                <UsuariosPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/produccion"
            element={
              <PrivateRoute roles={['panadero', 'admin']}>
                <ProduccionPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
