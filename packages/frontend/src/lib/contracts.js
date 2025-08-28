import { ethers } from 'ethers';
import LREG from '../abi/LearnerRegistry.min.json';
import REWARDER from '../abi/LearnToEarnRewarder.min.json';

export function getBrowserProvider() {
  if (!window.ethereum) throw new Error('MetaMask not detected');
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getBrowserProvider();
  await provider.send('eth_requestAccounts', []);
  return await provider.getSigner();
}

export function learnerRegistry(signerOrProvider) {
  const addr = import.meta.env.VITE_LEARNER_REGISTRY_ADDRESS;
  if (!addr) throw new Error('VITE_LEARNER_REGISTRY_ADDRESS missing');
  return new ethers.Contract(addr, LREG, signerOrProvider);
}

export function rewarder(signerOrProvider) {
  const addr = import.meta.env.VITE_REWARDER_ADDRESS;
  if (!addr) throw new Error('VITE_REWARDER_ADDRESS missing');
  return new ethers.Contract(addr, REWARDER, signerOrProvider);
}
