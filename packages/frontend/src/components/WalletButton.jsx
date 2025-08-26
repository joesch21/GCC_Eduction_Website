import { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';

// --- env & defaults ----------------------------------------------------------
const CHAIN_ID_HEX = '0x38'; // 56
const FALLBACK_RPC = 'https://bsc-dataseed.binance.org';
const FALLBACK_EXPLORER = 'https://bscscan.com';

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID;
const RPC_URL = import.meta.env.VITE_RPC_URL || FALLBACK_RPC;
const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL || FALLBACK_EXPLORER;

// --- optional Web3Modal (only if project id is provided) ---------------------
const chains = [{ chainId: 56, name: 'BSC', rpcUrl: RPC_URL }];
const modal =
  WC_PROJECT_ID
    ? createWeb3Modal({
        ethersConfig: defaultConfig({ appName: 'Lythera', chains, projectId: WC_PROJECT_ID })
      })
    : null;

export default function WalletButton() {
  const [address, setAddress] = useState();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false; // prevent setState on unmount
    };
  }, []);

  const hasEthereum = typeof window !== 'undefined' && window.ethereum;

  const metaMaskProvider = useMemo(() => {
    if (!hasEthereum) return null;
    try {
      return new ethers.BrowserProvider(window.ethereum);
    } catch {
      return null;
    }
  }, [hasEthereum]);

  async function ensureBSCWithMetaMask(provider) {
    // Try to switch first
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: CHAIN_ID_HEX }]);
      return;
    } catch (err) {
      // 4902 = chain not added; otherwise rethrow
      const needsAdd =
        err?.code === 4902 ||
        (typeof err?.message === 'string' && /add.*chain|unrecognized chain/i.test(err.message));
      if (!needsAdd) throw err;
    }

    // Add the chain with valid HTTPS URLs
    await provider.send('wallet_addEthereumChain', [
      {
        chainId: CHAIN_ID_HEX,
        chainName: 'BNB Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: [RPC_URL],
        blockExplorerUrls: [EXPLORER_URL]
      }
    ]);
  }

  async function connectWithModal() {
    const provider = await modal.connectWallet();
    // Web3Modal provider has helpers
    await provider.switchNetwork(56);
    const accounts = await provider.getAccounts();
    if (mounted.current) setAddress(accounts[0]);
  }

  async function connectWithMetaMask() {
    if (!metaMaskProvider) {
      alert('MetaMask not detected. Please install MetaMask or set VITE_WC_PROJECT_ID to use WalletConnect.');
      return;
    }
    await ensureBSCWithMetaMask(metaMaskProvider);
    const accounts = await metaMaskProvider.send('eth_requestAccounts', []);
    if (mounted.current) setAddress(accounts[0]);
  }

  async function connect() {
    try {
      if (modal) return await connectWithModal();
      return await connectWithMetaMask();
    } catch (e) {
      console.error('[wallet connect] error:', e);
      const msg =
        e?.message ||
        (typeof e === 'string' ? e : 'Wallet connect failed. Check network and RPC/Explorer env values.');
      alert(msg);
    }
  }

  function disconnect() {
    try {
      if (modal) modal.disconnect();
    } finally {
      if (mounted.current) setAddress(undefined);
    }
  }

  const btnLabel = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect Wallet';
  return (
    <button onClick={address ? disconnect : connect}>
      {btnLabel}
    </button>
  );
}
