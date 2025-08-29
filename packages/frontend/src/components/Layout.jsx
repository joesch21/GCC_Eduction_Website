import { Link } from 'react-router-dom';

export default function Layout({ children, headerRight }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: '#1c1c1c',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <nav style={{ display: 'flex', gap: '16px' }}>
          <Link to="/" style={{ color: '#ffd166' }}>Home</Link>
          <Link to="/learn/department1/1">Learn</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/community">Community</Link>
        </nav>
        <div style={{ display: 'flex', gap: 8 }}>
          {headerRight}
        </div>
      </header>

      <main style={{ flex: 1, padding: '24px', maxWidth: 960, margin: '0 auto' }}>
        {children}
      </main>

      <footer style={{ background: '#111', color: '#888', textAlign: 'center', padding: '8px 16px' }}>
        © 2025 Lythera Ecosystem • Learn Web3, Earn $GCC
      </footer>
    </div>
  );
}
