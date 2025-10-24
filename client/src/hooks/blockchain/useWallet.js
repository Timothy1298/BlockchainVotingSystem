import { useContext } from 'react';
import { WalletContext } from '../../contexts/blockchain/WalletContext';
export const useWallet = () => useContext(WalletContext);
export default useWallet;
