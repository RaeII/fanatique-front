# Estrutura do Fluxo de Login e Cadastro de Usuários

## Fluxo de Login/Cadastro

O sistema de login/cadastro da plataforma Fanatique utiliza carteiras Web3 (MetaMask) e segue um fluxo específico para garantir uma boa experiência do usuário:

### 1. Conexão da Carteira
- Usuário clica no botão "Conectar Carteira"
- Sistema solicita acesso à carteira via MetaMask sem pedir assinatura
- MetaMask exibe popup pedindo autorização para conectar
- Após autorização, o endereço da carteira (wallet address) é obtido

### 2. Verificação de Cadastro
- Com o endereço da carteira, sistema verifica no backend se o usuário já está cadastrado
- Endpoint `/wallet/check/:walletAddress` retorna flag `exists: true/false`
- Não gera erro caso usuário não exista, apenas informa que não está cadastrado

### 3. Fluxo de Registro (para novos usuários)
- Se o usuário não estiver cadastrado (`exists: false`), exibe formulário de registro
- Usuário informa seu nome de usuário
- Ao enviar o formulário, sistema solicita assinatura da mensagem pela carteira
- Mensagem assinada + nome são enviados ao backend para registro e geração de token
- Após registro bem-sucedido, usuário é redirecionado para o dashboard

### 4. Fluxo de Login (para usuários existentes)
- Se o usuário já estiver cadastrado (`exists: true`), exibe tela de login
- Usuário clica em "Entrar com Assinatura"
- Sistema solicita assinatura da mensagem pela carteira
- Mensagem assinada é enviada ao backend para validação e geração de token
- Após login bem-sucedido, usuário é redirecionado para o dashboard

## Benefícios deste Fluxo

1. **Experiência gradual**: Primeiro solicita apenas conexão da carteira, depois assinatura se necessário
2. **Solicitação de nome apenas quando necessário**: Não pede nome para usuários já cadastrados
3. **Evita erros desnecessários**: A verificação de cadastro não gera erros, apenas flags
4. **Assinatura em momento apropriado**: Solicita assinatura apenas após confirmação de ação pelo usuário

## Implementação Técnica

- **`connectWalletOnly()`**: Apenas conecta a carteira para obter o endereço
- **`checkWalletExists()`**: Verifica no backend se o usuário já está cadastrado
- **`registerWithSignature()`**: Registra novo usuário + solicita assinatura em um passo
- **`requestSignature()`**: Solicita assinatura para usuários já cadastrados

## Endpoints Envolvidos

- **`GET /wallet/check/:walletAddress`**: Verifica se a carteira já está cadastrada
- **`POST /wallet/signature`**: Valida assinatura e gera JWT (com ou sem nome para registro)
- **`GET /wallet/me`**: Verifica se o token JWT do usuário é válido

## Comportamento da UI

- **Estado inicial**: Mostra botão "Conectar Carteira"
- **Carteira conectada, usuário não cadastrado**: Mostra formulário de nome
- **Carteira conectada, usuário cadastrado**: Mostra botão "Entrar com Assinatura"
- **Usuário autenticado**: Redireciona para o dashboard
