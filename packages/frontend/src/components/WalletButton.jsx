import { useState } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';

const projectId = import.meta.env.VITE_WC_PROJECT_ID;
const chains = [{ chainId: 56, name: 'BSC', rpcUrl: import.meta.env.VITE_RPC_URL }];
const modal = createWeb3Modal({ ethersConfig: defaultConfig({ appName: 'Lythera', chains, projectId }) });

export default function WalletButton() {
  const [address, setAddress] = useState();

  async function connect() {
    const provider = await modal.connectWallet();
    await provider.switchNetwork(56);
    const accounts = await provider.getAccounts();
    setAddress(accounts[0]);
  }

  function disconnect() {
    modal.disconnect();
    setAddress(undefined);
  }

  const text = address ? address.slice(0, 6) + '…' : 'Connect Wallet';
  return <button onClick={address ? disconnect : connect}>{text}</button>;
}