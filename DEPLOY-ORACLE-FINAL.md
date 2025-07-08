# Deploy para Oracle Cloud - Checklist Final

## ✅ Pré-Deploy Checklist

### 🔐 Segurança
- [x] Senhas de produção alteradas (complexas)
- [x] Logs de debug removidos/silenciados
- [x] HTTPS configurado
- [x] Cabeçalhos de segurança configurados
- [ ] Usuário 'demo' removido/desabilitado (opcional)

### 📁 Arquivos Necessários
```
index.html
login.html  
help.html
css/
  ├── styles.css
  └── login.css
js/
  ├── production-config.js (NOVO)
  ├── auth.js
  ├── login.js
  ├── app.js
  ├── cache-manager.js
  ├── dashboard-manager.js
  ├── export-manager.js
  ├── firmware-manager.js
  ├── performance-manager.js
  └── reset-system.js
users.json
favicon.svg
package.json (se usar proxy)
proxy-server.js (se usar proxy)
.env.production.example
```

### 🗑️ Arquivos para NÃO enviar
- Todos os arquivos de debug, test, exemplo
- Documentação interna (.md files)
- .git, .vscode, .github
- node_modules (reinstalar no servidor)
- Arquivos listados em ARQUIVOS-PARA-REMOVER.txt

## 🚀 Comandos de Deploy

### Se usar Node.js (proxy):
```bash
npm install --production
npm start
```

### Se usar apenas estático:
- Upload dos arquivos HTML/CSS/JS
- Configurar servidor web para servir index.html

## 🔒 Credenciais de Produção

### Usuários Atualizados:
- **admin**: `AllC0m@dm1n2025!`
- **tecnico**: `T3cn1c0@2025!`  
- **consultor**: `C0nsult0r@2025!`
- **gerente**: `G3r3nt3@2025!`

⚠️ **IMPORTANTE**: Altere essas senhas após o primeiro login!

## 🌐 Configuração de Domínio

1. Configure DNS para seu domínio Oracle
2. Configure certificado SSL
3. Teste todas as funcionalidades
4. Configure backup de `users.json`

## 📊 Monitoramento

- Monitor logs de erro
- Monitor performance
- Monitor tentativas de login
- Backup regular de configurações
