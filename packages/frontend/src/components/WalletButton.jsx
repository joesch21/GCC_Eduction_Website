import { useState } from 'react';
import { ethers } from 'ethers';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';

const projectId = import.meta.env.VITE_WC_PROJECT_ID;
const chains = [{ chainId: 56, name: 'BSC', rpcUrl: import.meta.env.VITE_RPC_URL }];

let modal = null;
if (projectId) {
  modal = createWeb3Modal({
    ethersConfig: defaultConfig({ appName: 'Lythera', chains, projectId })
  });
}

export default function WalletButton() {
  const [address, setAddress] = useState();

  async function connectWithModal() {
    const provider = await modal.connectWallet();
    await provider.switchNetwork(56);
    const accounts = await provider.getAccounts();
    setAddress(accounts[0]);
  }

  async function connectWithMetaMask() {
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install MetaMask or set VITE_WC_PROJECT_ID for WalletConnect.');
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('wallet_addEthereumChain', [{
      chainId: '0x38',
      chainName: 'BNB Smart Chain',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: [import.meta.env.VITE_RPC_URL],
      blockExplorerUrls: [import.meta.env.VITE_EXPLORER_URL]
    }]);
    const accounts = await provider.send('eth_requestAccounts', []);
    setAddress(accounts[0]);
  }

  async function connect() {
    try {
      if (modal) return await connectWithModal();
      return await connectWithMetaMask();
    } catch (e) {
      console.error(e);
      alert('Wallet connect failed: ' + (e?.message || e));
    }
  }

  function disconnect() {
    if (modal) modal.disconnect();
    setAddress(undefined);
  }

  const text = address ? address.slice(0, 6) + '…' + address.slice(-4) : 'Connect Wallet';
  return <button onClick={address ? disconnect : connect}>{text}</button>;
}
