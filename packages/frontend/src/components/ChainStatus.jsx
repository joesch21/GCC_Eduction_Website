import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function ChainStatus() {
  const [chainId, setChainId] = useState();
  const [address, setAddress] = useState();

  useEffect(() => {
    let sub = false;
    async function probe() {
      if (!window.ethereum) return;
      const p = new ethers.BrowserProvider(window.ethereum);
      try {
        const net = await p.getNetwork();
        const accs = await p.send('eth_accounts', []);
        if (!sub) {
          setChainId(Number(net.chainId));
          setAddress(accs?.[0]);
        }
      } catch {}
      if (window.ethereum?.on) {
        const onChain = id => setChainId(Number(id));
        const onAcc = accs => setAddress(accs?.[0]);
        window.ethereum.on('chainChanged', onChain);
        window.ethereum.on('accountsChanged', onAcc);
        return () => {
          window.ethereum.removeListener('chainChanged', onChain);
          window.ethereum.removeListener('accountsChanged', onAcc);
        };
      }
    }
    const cleanup = probe();
    return () => { sub = true; cleanup && cleanup(); };
  }, []);

  const short = a => (a ? `${a.slice(0,6)}…${a.slice(-4)}` : '—');
  const ok = chainId === 56;

  return (
    <span style={{
      marginLeft: 8,
      padding: '2px 8px',
      borderRadius: 8,
      background: ok ? '#1b5e20' : '#7b1fa2',
      color: '#fff',
      fontSize: 12
    }}>
      {ok ? 'BSC(56)' : `Chain ${chainId ?? '—'}`} • {short(address)}
    </span>
  );
}
