# Guia de Solução de Problemas em Produção - Allcom JC450

Este documento contém soluções para problemas comuns que podem ocorrer na versão em produção do sistema Allcom JC450 na Oracle Cloud.

## Problemas de Conexão API

### 1. Erro de CORS

**Sintoma:** Console do navegador mostra erro "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Soluções:**
- Verifique o valor de `CORS_ORIGIN` no arquivo `.env`
- Confirme que o domínio configurado corresponde exatamente ao usado para acessar o sistema
- Teste adicionando seu domínio específico ao invés de usar `*`

### 2. Erro de Autenticação na API

**Sintoma:** Respostas 401/403 ao consultar equipamentos

**Soluções:**
- Confirme que `JIMICLOUD_APP_KEY` e `JIMICLOUD_SECRET` estão corretos no `.env`
- Verifique se o token está sendo obtido corretamente (veja logs)
- Tente renovar o token manualmente reiniciando o servidor

## Problemas de Login

### 1. Não é possível fazer login mesmo com credenciais corretas

**Soluções:**
- Verifique se `users.json` está acessível
- Confirme que existe na mesma pasta do `proxy-server.js`
- Restaure o backup de `users.json` se necessário

### 2. Sessão expira rapidamente

**Solução:** 
- Edite o arquivo `js/login.js` e altere o valor de `sessionDuration` (em segundos)

## Problemas de Proxy

### 1. Servidor proxy não inicia

**Sintomas:** Erro ao iniciar com `npm start`

**Soluções:**
- Verifique se a porta configurada (PORT) não está em uso
- Confirme que todas as dependências foram instaladas com `npm install`
- Verifique permissões de arquivo e acesso ao diretório

### 2. Timeout nas requisições

**Sintoma:** Consultas de IMEI falham após um longo tempo

**Soluções:**
- Aumente o valor de `API_TIMEOUT` no arquivo `.env`
- Reduza o número de IMEIs por lote (MAX_BATCH_SIZE)
- Verifique a conectividade de rede da Oracle Cloud para a API externa

## Erros no Console

### 1. Erros javascript no console do navegador

**Soluções:**
- Confirme que todos os arquivos js foram copiados corretamente
- Verifique se a ordem dos scripts no HTML está correta
- Se estiver usando CDN, verifique conectividade

### 2. Logs excessivos

**Solução:**
- Confirme que `production-config.js` está sendo carregado antes dos outros scripts

## Recursos e Contatos

### Arquivos de Backup
- Mantenha backups de `users.json` e `.env` em local seguro
- Documente todas as alterações feitas em produção

### Recuperação de Emergência
1. Restaure os arquivos do último backup conhecido
2. Reinstale as dependências com `npm install --production`
3. Reinicie o servidor com `npm start`

### Contato Suporte
- Telefone: (XX) XXXX-XXXX
- Email: suporte@allcom.com
