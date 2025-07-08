# Gerenciamento de Usuários - Allcom JC450

## 📋 Visão Geral

Este documento explica como gerenciar usuários e senhas no sistema Allcom JC450 de forma fácil e segura.

## 📁 Arquivo de Usuários

O arquivo `users.json` contém todas as configurações de usuários do sistema. Este arquivo está estruturado de forma simples para facilitar a edição.

### 🗂️ Estrutura do Arquivo

```json
{
  "users": {
    "nome_usuario": {
      "password": "senha_do_usuario",
      "name": "Nome Completo",
      "role": "tipo_de_perfil",
      "permissions": ["lista", "de", "permissoes"],
      "lastLogin": null,
      "email": "email@empresa.com",
      "active": true
    }
  },
  "config": {
    "sessionTimeout": 480,
    "maxLoginAttempts": 5,
    "lockoutDuration": 300,
    "passwordMinLength": 6,
    "rememberMeDuration": 2592000
  }
}
```

## 👥 Perfis de Usuário

### 🔴 Admin (Administrador)
- **Permissões**: `["read", "write", "admin"]`
- **Acesso**: Total ao sistema
- **Função**: Gerenciar usuários, configurações e todas as funcionalidades

### 🟡 Manager (Gerente)
- **Permissões**: `["read", "write", "reports"]`
- **Acesso**: Consultas, relatórios e gestão operacional
- **Função**: Supervisionar operações e gerar relatórios

### 🟢 Technician (Técnico)
- **Permissões**: `["read", "write"]`
- **Acesso**: Consultar e atualizar informações de equipamentos
- **Função**: Manutenção técnica e suporte

### 🔵 Viewer (Consultor)
- **Permissões**: `["read"]`
- **Acesso**: Apenas consulta (somente leitura)
- **Função**: Visualizar relatórios e status dos equipamentos

### 🟠 Demo (Demonstração)
- **Permissões**: `["read"]`
- **Acesso**: Limitado para demonstrações
- **Função**: Apresentações e testes do sistema

## ⚙️ Como Adicionar um Novo Usuário

1. **Abra o arquivo** `users.json`
2. **Adicione uma nova entrada** na seção "users":

```json
"novo_usuario": {
  "password": "senha_segura",
  "name": "Nome do Usuário",
  "role": "technician",
  "permissions": ["read", "write"],
  "lastLogin": null,
  "email": "usuario@empresa.com",
  "active": true
}
```

3. **Salve o arquivo**
4. **Reinicie o sistema** (se necessário)

## 🔧 Como Alterar uma Senha

1. **Localize o usuário** no arquivo `users.json`
2. **Altere o campo "password"**:
   ```json
   "password": "nova_senha_aqui"
   ```
3. **Salve o arquivo**

## 🚫 Como Desativar um Usuário

1. **Localize o usuário** no arquivo `users.json`
2. **Altere o campo "active"**:
   ```json
   "active": false
   ```
3. **Salve o arquivo**

## 🔒 Configurações de Segurança

No arquivo `users.json`, você pode ajustar as configurações de segurança:

```json
"config": {
  "maxLoginAttempts": 5,        // Máximo de tentativas de login
  "lockoutDuration": 300,       // Tempo de bloqueio (segundos)
  "passwordMinLength": 6        // Tamanho mínimo da senha
}
```

**Nota:** O sistema não possui expiração automática de sessão. Uma vez logado, o usuário permanece autenticado até fazer logout manualmente.

## 📝 Usuários Padrão do Sistema

| Usuário   | Senha       | Perfil       | Descrição                    |
|-----------|-------------|--------------|------------------------------|
| admin     | admin123    | Admin        | Administrador do sistema     |
| tecnico   | tecnico123  | Technician   | Técnico especialista         |
| consultor | consultor123| Viewer       | Consultor de vendas          |
| gerente   | gerente456  | Manager      | Gerente de operações         |
| demo      | demo123     | Demo         | Usuário para demonstrações  |

## 🔐 Boas Práticas de Segurança

1. **Senhas Fortes**: Use senhas com pelo menos 8 caracteres, incluindo números e símbolos
2. **Troca Regular**: Altere senhas periodicamente
3. **Usuários Únicos**: Não compartilhe credenciais entre pessoas
4. **Desativação**: Desative usuários que não estão mais na empresa
5. **Backup**: Faça backup regular do arquivo `users.json`

## 🚨 Troubleshooting

### Problema: Usuário não consegue fazer login
- ✅ Verifique se o usuário existe no arquivo `users.json`
- ✅ Confirme se `"active": true`
- ✅ Verifique se a senha está correta
- ✅ Confira se não há espaços extras na senha

### Problema: Arquivo JSON com erro
- ✅ Valide a sintaxe JSON em um validador online
- ✅ Verifique vírgulas e chaves
- ✅ Confirme aspas duplas em todas as strings

### Problema: Permissões não funcionam
- ✅ Verifique se as permissões estão escritas corretamente
- ✅ Confirme se o array de permissões está bem formatado
- ✅ Reinicie o sistema após alterações

## 📞 Suporte

Para dúvidas sobre o gerenciamento de usuários:
1. Consulte este documento
2. Verifique o arquivo `README.md` do projeto
3. Entre em contato com o administrador do sistema

---

**⚠️ Importante**: Sempre faça backup do arquivo `users.json` antes de fazer alterações importantes!

## 🌐 Diferenças entre Ambiente Local e Servidor

### 📁 Ambiente Local (file://)
Quando você abre o arquivo `login.html` diretamente no navegador:
- ✅ O sistema usa configuração **embutida** no código
- ✅ Todos os usuários padrão ficam disponíveis
- ❌ Não carrega o arquivo `users.json` (limitação de segurança do navegador)
- ✅ Ideal para **desenvolvimento** e **testes**

### 🌐 Ambiente Servidor (http:// ou https://)
Quando você executa via servidor web:
- ✅ O sistema carrega o arquivo `users.json` automaticamente
- ✅ Personalizações de usuários funcionam completamente
- ✅ Ideal para **produção**

### 🔧 Como Usar com Servidor Local
Para testar com o arquivo `users.json` funcionando:

1. **Use o servidor proxy incluído:**
   ```bash
   npm install
   npm start
   ```
   
2. **Acesse via:** `http://localhost:3000/login.html`

3. **Ou use qualquer servidor HTTP simples:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (live-server)
   npx live-server
   ```
