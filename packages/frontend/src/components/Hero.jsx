import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';

export default function Hero() {
  const [status, setStatus] = useState('Wallet not connected');

  useEffect(() => {
    let stale = false;

    async function probe() {
      if (!window.ethereum) {
        if (!stale) setStatus('Wallet not connected');
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      try {
        const net = await provider.getNetwork();
        const accs = await provider.send('eth_accounts', []);
        if (!stale) {
          if (accs?.[0]) {
            setStatus(`Connected • ${net?.name ?? 'BSC'} (${Number(net.chainId)})`);
          } else {
            setStatus('Wallet not connected');
          }
        }
      } catch {
        if (!stale) setStatus('Wallet not connected');
      }
    }

    probe();
    if (window.ethereum?.on) {
      const onChange = () => probe();
      window.ethereum.on('chainChanged', onChange);
      window.ethereum.on('accountsChanged', onChange);
      return () => {
        stale = true;
        window.ethereum.removeListener('chainChanged', onChange);
        window.ethereum.removeListener('accountsChanged', onChange);
      };
    }
    return () => { stale = true; };
  }, []);

  return (
    <section className="hero full-viewport" aria-labelledby="hero-title">
      <div className="container" style={{ textAlign: 'center' }}>
        {/* Logo (mobile-first sizing comes from .hero-logo) */}
        <img
          src="/lythera.jpeg"
          alt="The Lythera Ecosystem"
          className="hero-logo"
          width="480"
          height="480"
          loading="eager"
          decoding="async"
        />

        {/* Title + Tagline use responsive clamp() sizes from CSS */}
        <h1 id="hero-title" className="hero-title">
          THE LYTHERA ECOSYSTEM
        </h1>
        <p className="hero-tagline">
          Learn. Earn. Belong. The Lythera Ecosystem turns knowledge into $GCC rewards.
        </p>

        {/* Primary Actions */}
        <div className="hero-ctas">
          <Link to="/learn/department1/1" className="cta-primary" role="button" aria-label="Enter the Academy">
            Enter the Academy
          </Link>
          <Link to="/community" className="cta-secondary" role="button" aria-label="Join the community">
            Join the Condorians
          </Link>
        </div>

        {/* Status pill (uses .pill utility) */}
        <div style={{ marginTop: 16 }}>
          <span className="pill" aria-live="polite">{status}</span>
        </div>

        {/* Optional small meta */}
        <div className="hero-status">
          Mobile-first • Dark mode • BSC (56)
        </div>
      </div>
    </section>
  );
}
