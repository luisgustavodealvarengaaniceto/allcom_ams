# 🚀 INÍCIO RÁPIDO - Sistema de Login Allcom JC450

## ⚡ Testando o Sistema (2 opções)

### 🌟 OPÇÃO 1: Teste Rápido (Recomendado)
1. **Abra diretamente**: `login.html` no navegador
2. **Use as credenciais**: `admin` / `admin123`
3. **Funciona imediatamente** com usuários padrão

### 🔧 OPÇÃO 2: Teste Completo com Servidor
1. **Execute o servidor**:
   ```bash
   npm install
   npm start
   ```
2. **Acesse**: http://localhost:3000/login.html
3. **Personalização completa** via `users.json`

## 👥 Usuários Disponíveis

| Usuário   | Senha       | Perfil       | Descrição                    |
|-----------|-------------|--------------|------------------------------|
| admin     | admin123    | Admin        | Acesso total ao sistema      |
| gerente   | gerente456  | Manager      | Gerente de operações         |
| tecnico   | tecnico123  | Technician   | Técnico especialista         |
| consultor | consultor123| Viewer       | Consultor (somente leitura)  |
| demo      | demo123     | Demo         | Usuário para demonstrações  |

## 🎯 Fluxo de Teste

1. **Login** → Use qualquer credencial acima
2. **Sistema Principal** → Acesso automático ao `index.html`
3. **Logout** → Clique no botão "Sair" no cabeçalho
4. **Login Novamente** → Teste outros usuários

## 🛠️ Personalização Rápida

### Para adicionar um usuário (via código):
1. **Edite**: `js/login.js`
2. **Localize**: função `getDefaultUsers()`
3. **Adicione** uma nova entrada no objeto

### Para personalizar via arquivo (servidor necessário):
1. **Edite**: `users.json`
2. **Reinicie** o servidor
3. **Teste** as alterações

## 🔐 Recursos do Sistema de Login

- ✅ **Validação de credenciais**
- ✅ **Sessões persistentes**
- ✅ **"Lembrar de mim"**
- ✅ **Auto-logout** por inatividade
- ✅ **Múltiplos perfis** de usuário
- ✅ **Interface responsiva**
- ✅ **Proteção de rotas**
- ✅ **Feedback visual** com toasts

## 🚨 Solução de Problemas

### Erro de CORS (arquivo local):
- **Normal** quando abrir via `file://`
- **Solução**: Use um servidor HTTP ou aceite a configuração padrão

### Login não funciona:
- ✅ Confira usuário/senha (case-sensitive)
- ✅ Verifique se o JavaScript está habilitado
- ✅ Abra o console do navegador para ver erros

### Não redireciona após login:
- ✅ Verifique se existe o arquivo `index.html`
- ✅ Confirme que não há erros no console
- ✅ Teste com um usuário diferente

## 📞 Suporte

- **Manual Completo**: `USUARIOS-MANUAL.md`
- **Documentação**: `README.md`
- **Console do Navegador**: F12 → Console (para debugging)

---

**🎉 Pronto! Seu sistema de login está funcionando!**
