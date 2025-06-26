# Configuração de Variáveis de Ambiente para Fanatique Frontend

Para que o sistema de verificação de rede Chiliz funcione corretamente, você precisará configurar as seguintes variáveis de ambiente no arquivo `.env` na raiz do projeto:

```env
# API Configuration
API_URL=http://localhost:8000/api

# Chiliz Network Configuration - Spicy Testnet
VITE_NETWORK_ID_CHILIZ=0x15b38
VITE_CHAIN_NAME=Chiliz Chain
VITE_RPC_URL=https://spicy-rpc.chiliz.com/
VITE_SYMBOL=CHZ
VITE_BLOCK_EXPLORER_URL=https://spicy-explorer.chiliz.com
```

## Como usar

1. Crie um arquivo chamado `.env` na raiz do projeto
2. Copie o conteúdo acima para o arquivo
3. Ajuste os valores conforme necessário para seu ambiente

## Observações Importantes

### Formato do Chain ID
- O ID da rede (VITE_NETWORK_ID_CHILIZ) deve estar no formato hexadecimal **prefixado com "0x"**
- Para a testnet Spicy: `0x15b38`
- Para a rede principal (mainnet): `0x15b37`
- Se você tiver o valor em decimal (por exemplo, 88882 para Spicy), precisará convertê-lo para hexadecimal com prefixo 0x

### Outras configurações
- Certifique-se de que as URLs do RPC e do explorador de blocos estão corretas para o ambiente desejado
- Se você não tiver o BLOCK_EXPLORER_URL, remova essa linha ou deixe em branco

## Valores de referência para redes da Chiliz

### Spicy Testnet
- Chain ID: 0x15b38 (decimal: 88888)
- RPC URL: https://spicy-rpc.chiliz.com/
- Explorer: https://spicy-explorer.chiliz.com

### Mainnet
- Chain ID: 0x15b37 (decimal: 88887)
- RPC URL: https://rpc.chiliz.com/
- Explorer: https://explorer.chiliz.com 