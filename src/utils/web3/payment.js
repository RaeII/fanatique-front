import { useContracts } from './contracts';
import { useContext } from 'react';
import { WalletContext } from '../../contexts/WalletContextDef';
import { ethers } from 'ethers';

export function usePayment() {

    const { getSigner, isConnected, provider } = useContext(WalletContext);
    const { getContracts } = useContracts();

    // 1. Usuário solicita pagamento
    async function paymentSignature(orderId, amount, erc20Id) {
        try {   
            const { fanatiqueContractAddress, brzContract } = await getContracts();

            if (!isConnected) {
                throw new Error("conecte sua carteira.");
            }

            // Obter o signer usando getSigner
            const signer = await getSigner();

            // Verificar se o signer está disponível
            if (!signer) {
                throw new Error("Carteira bloqueada ou não disponível");
            }

            let userAddress;
            try {
                userAddress = await signer.getAddress();
            } catch {
                throw new Error("Por favor, desbloqueie sua carteira.");
            }
            
            // Converte amount para BigInt se for string
            const amountBigInt = ethers.parseUnits(amount.toString(), 6);

            // Obter chainId
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);
                        
            // Obter nonce atual (necessário para a permissão EIP-2612)
            const nonce = await brzContract.nonces(userAddress);
            
            // Computa o hash da mensagem para a assinatura da ordem
            // Ajustado para corresponder ao formato usado no contrato
            const messageHash = ethers.solidityPackedKeccak256(
                ['uint256', 'address', 'uint256', 'address', 'uint256'],
                [orderId, userAddress, amountBigInt, fanatiqueContractAddress, chainId]
            );
            
            // Converte o hash para bytes
            const messageBytes = ethers.getBytes(messageHash);
            
            // Assina a mensagem (prefixo EIP-191/Ethereum) para obter a orderSignature
            const orderSignature = await signer.signMessage(messageBytes);
            
            // Verificar se o contrato BRZ suporta EIP-2612 chamando o método DOMAIN_SEPARATOR
            try {
                await brzContract.DOMAIN_SEPARATOR();
            } catch (error) {
                console.error('Contrato não suporta EIP-2612 (sem DOMAIN_SEPARATOR):', error);
                throw new Error('Este token não suporta o padrão EIP-2612 Permit');
            }
            
            // Dados para assinatura EIP-2612 Permit
            const domain = {
              name: await brzContract.name(),
              version: '1',
              chainId: chainId,
              verifyingContract: brzContract.target
            };
                        
            const types = {
              Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
              ]
            };
            
            const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hora
            
            const permitValue = {
              owner: userAddress,
              spender: fanatiqueContractAddress,
              value: amountBigInt,
              nonce: nonce,
              deadline: deadline
            };
                        
            // Assinar usando o formato EIP-2612 Permit
            const permitSignature = await signer.signTypedData(domain, types, permitValue);
            
            const sig = ethers.Signature.from(permitSignature);
            
            // Retorna os dados necessários alinhados com o backend
            return {
                orderId,
                userAddress: userAddress,
                amount: amount.toString(),
                signature: orderSignature,
                erc20Id: erc20Id,
                permitV: sig.v,
                permitR: sig.r,
                permitS: sig.s,
                deadline: deadline
            };
        } catch (err) {
            console.error('Erro ao assinar pagamento:', err);
            if (err.message) {
                throw new Error(`Erro ao assinar pagamento:\n${err.message}`);
            } else {
                throw new Error('Erro ao assinar pagamento');
            }
        }
    }

    return {
        paymentSignature
    };
}

export default usePayment;