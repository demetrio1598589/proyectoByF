export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">🥖</span>
          <span>Panadería <strong>ByF</strong></span>
        </div>
        <p className="footer-copy">
          &copy; {year} Panadería ByF — Hecho con amor y harina
        </p>
        <div className="footer-links">
          <span>Pan Francés</span>
          <span>·</span>
          <span>Croissants</span>
          <span>·</span>
          <span>Tortas</span>
        </div>
      </div>
    </footer>
  )
}
