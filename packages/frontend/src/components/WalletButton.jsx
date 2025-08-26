import { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';

// BSC (56) constants + safe defaults
const CHAIN_ID_DEC = 56;
const CHAIN_ID_HEX = '0x38'; // 56
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://bsc-dataseed.binance.org';
const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL || 'https://bscscan.com';

export default function WalletButton() {
  const [address, setAddress] = useState();
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const hasEthereum = typeof window !== 'undefined' && window.ethereum;
  const provider = useMemo(() => {
    if (!hasEthereum) return null;
    try { return new ethers.BrowserProvider(window.ethereum); } catch { return null; }
  }, [hasEthereum]);

  async function ensureBSC() {
    if (!provider) throw new Error('MetaMask not detected');
    // Try to switch first (fast path)
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: CHAIN_ID_HEX }]);
      return;
    } catch (err) {
      const needsAdd =
        err?.code === 4902 ||
        (typeof err?.message === 'string' && /add.*chain|unrecognized chain/i.test(err.message));
      if (!needsAdd) throw err;
    }
    // Add BSC with valid HTTPS urls
    await provider.send('wallet_addEthereumChain', [{
      chainId: CHAIN_ID_HEX,
      chainName: 'BNB Smart Chain',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: [RPC_URL],
      blockExplorerUrls: [EXPLORER_URL]
    }]);
  }

  async function connect() {
    try {
      if (!provider) {
        alert('MetaMask not detected. Please install MetaMask.');
        return;
      }
      await ensureBSC();
      const accounts = await provider.send('eth_requestAccounts', []);
      if (mounted.current) setAddress(accounts[0]);
    } catch (e) {
      console.error('[wallet connect] error:', e);
      alert(e?.message || 'Wallet connect failed.');
    }
  }

  function disconnect() {
    if (mounted.current) setAddress(undefined);
  }

  const label = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect Wallet';
  return <button onClick={address ? disconnect : connect}>{label}</button>;
}

