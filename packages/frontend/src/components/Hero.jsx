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
            setStatus(`Connected: ${net.name} (${Number(net.chainId)})`);
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
    return () => {
      stale = true;
    };
  }, []);

  return (
    <div className="hero">
      <img src="/lythera.jpeg" alt="Lythera logo" className="hero-logo" />
      <p className="hero-tagline">
        Learn. Earn. Belong. The Lythera Ecosystem turns knowledge into $GCC rewards.
      </p>
      <div className="hero-ctas">
        <Link to="/learn" className="cta-primary">Enter the Academy</Link>
        <Link to="/community" className="cta-secondary">Join the Condorians</Link>
      </div>
      <div className="hero-status">{status}</div>
    </div>
  );
}

