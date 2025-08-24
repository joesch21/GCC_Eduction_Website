import { useEffect } from 'react';
import { ethers } from 'ethers';

export default function NetworkGuard({ children }) {
  useEffect(() => {
    async function ensure() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== 56n) {
          await provider.send('wallet_switchEthereumChain', [{ chainId: '0x38' }]);
        }
      }
    }
    ensure();
  }, []);
  return children;
}