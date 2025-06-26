import { useState, useEffect } from 'react';
import { Button } from './ui-v2/Button';

export function MetaMaskDebug() {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar se o MetaMask está instalado
    const checkMetaMask = () => {
      if (window.ethereum && window.ethereum.isMetaMask) {
        setHasMetaMask(true);
        
        // Verificar se já existe uma conta conectada
        window.ethereum.request({ method: 'eth_accounts' })
          .then(accounts => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            }
          })
          .catch(err => {
            console.error("Erro ao verificar contas:", err);
          });
        
        // Obter a chainId atual
        window.ethereum.request({ method: 'eth_chainId' })
          .then(chainId => {
            setChainId(chainId);
          })
          .catch(err => {
            console.error("Erro ao obter chainId:", err);
          });
          
        // Adicionar listeners
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        });
        
        window.ethereum.on('chainChanged', (chainId) => {
          setChainId(chainId);
        });
      } else {
        setHasMetaMask(false);
      }
    };
    
    checkMetaMask();
    
    return () => {
      // Remover listeners
      if (window.ethereum && window.ethereum.isMetaMask) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);
  
  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask não está instalado");
      }
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
            
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        throw new Error("Nenhuma conta encontrada");
      }
    } catch (err) {
      console.error("Erro ao conectar:", err);
      setError(err.message || "Erro desconhecido ao conectar");
    } finally {
      setConnecting(false);
    }
  };
  
  return (
    <div className="p-4 bg-white/10 rounded-lg shadow-md my-4">
      <h2 className="text-xl font-bold mb-4">Diagnóstico MetaMask</h2>
      
      <div className="space-y-2 mb-4">
        <p>MetaMask instalado: <span className={hasMetaMask ? "text-green-500" : "text-red-500"}>{hasMetaMask ? "Sim" : "Não"}</span></p>
        <p>Conta conectada: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Nenhuma"}</p>
        <p>Chain ID: {chainId || "Desconhecido"}</p>
        {error && <p className="text-red-500">Erro: {error}</p>}
      </div>
      
      <Button
        onClick={handleConnect}
        text={connecting ? "Conectando..." : "Testar Conexão Direta"}
        disabled={connecting}
      />
    </div>
  );
} 