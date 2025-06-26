import { ethers } from 'ethers';
import FanTokenContract from '../../abi/FanToken.json'
import FanatiqueContract from '../../abi/Fanatique.json'
import { useContext } from 'react';
import { WalletContext } from '../../contexts/WalletContextDef';
import BrzContract from '../../abi/BRL.json'

const FANTOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_FANTOKEN_CONTRACT_ADDRESS;
const FANATIQUE_CONTRACT_ADDRESS = import.meta.env.VITE_FANATIQUE_CONTRACT_ADDRESS;
const BRZ_CONTRACT_ADDRESS = import.meta.env.VITE_BRZ_CONTRACT_ADDRESS;
// Hook para usar os contratos com o provider do WalletContext
export const useContracts = () => {
  const { getSigner } = useContext(WalletContext);
  
  // Cria os contratos com o provider ou signer atual
  const getContracts = async () => {
    // Obter o signer através da função getSigner
    const signer = await getSigner();
    
    if (!signer) {
      throw new Error('Conecte sua carteira!');
    }
    
    const fanTokenContract = new ethers.Contract(
      FANTOKEN_CONTRACT_ADDRESS,
      FanTokenContract.abi,
      signer
    );

    const fanatiqueContract = new ethers.Contract(
      FANATIQUE_CONTRACT_ADDRESS,
      FanatiqueContract.abi,
      signer
    );

    const brzContract = new ethers.Contract(
      BRZ_CONTRACT_ADDRESS,
      BrzContract.abi,
      signer
    );
    
    return {
      fanTokenContract,
      fanatiqueContract,
      brzContract,
      fanTokenContractAddress: FANTOKEN_CONTRACT_ADDRESS,
      fanatiqueContractAddress: FANATIQUE_CONTRACT_ADDRESS,
      brzContractAddress: BRZ_CONTRACT_ADDRESS
    };
  };
  
  return { getContracts };
};

export default useContracts;

