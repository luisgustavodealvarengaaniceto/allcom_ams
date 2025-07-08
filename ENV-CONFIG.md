# 🔧 Configuração de Ambiente - Allcom JC450

## 📋 Arquivo .env Criado

O arquivo `.env` foi criado com todas as configurações necessárias para o sistema Allcom JC450.

## ⚙️ Variáveis Principais

### 🔑 **Autenticação JimiCloud (OBRIGATÓRIO)**
```env
JIMICLOUD_APP_KEY=Jimiiotbrasil
JIMICLOUD_SECRET=23dd6cca658b4ec298aeb7beb4972fd4
```

### 🌐 **API Configuration**
```env
API_ENDPOINT=http://fota-api.jimicloud.com
API_TIMEOUT=30000
API_MAX_BATCH_SIZE=100
```

### 🖥️ **Servidor Local**
```env
PORT=3001
NODE_ENV=development
```

## 🚀 Como Usar

### 1️⃣ **Desenvolvimento Local**
```bash
# O arquivo .env já está configurado
npm start
```

### 2️⃣ **Deploy no Vercel**
As variáveis de ambiente serão automaticamente detectadas. Se necessário, configure no dashboard do Vercel:

1. Acesse: Vercel Dashboard > Seu Projeto > Settings > Environment Variables
2. Adicione as variáveis importantes:
   - `JIMICLOUD_APP_KEY`
   - `JIMICLOUD_SECRET`
   - `NODE_ENV=production`

### 3️⃣ **Personalização**

#### Para mudar o timeout da API:
```env
API_TIMEOUT=45000  # 45 segundos
```

#### Para habilitar logs detalhados:
```env
ENABLE_DEBUG_LOGS=true
LOG_LEVEL=debug
```

#### Para limitar quantidade de IMEIs por requisição:
```env
API_MAX_BATCH_SIZE=50
```

## 📊 Variáveis por Categoria

### 🔧 **Performance**
- `API_TIMEOUT` - Timeout das requisições (ms)
- `MAX_CONCURRENT_REQUESTS` - Requisições simultâneas
- `REQUEST_DELAY` - Delay entre requisições (ms)
- `CACHE_TTL` - Tempo de vida do cache (ms)

### 🎛️ **Funcionalidades**
- `ENABLE_CACHE` - Habilitar sistema de cache
- `ENABLE_DASHBOARD` - Habilitar dashboard
- `ENABLE_EXPORT` - Habilitar exportação
- `ENABLE_FIRMWARE_MANAGER` - Habilitar gerenciador de firmware

### 🛡️ **Segurança**
- `RATE_LIMIT_REQUESTS` - Limite de requisições
- `RATE_LIMIT_WINDOW` - Janela de tempo para rate limit (ms)
- `SESSION_TIMEOUT` - Timeout de sessão (ms)

### 📝 **Logging**
- `LOG_LEVEL` - Nível de log (error, warn, info, debug)
- `LOG_API_REQUESTS` - Log de requisições à API
- `LOG_ERRORS` - Log de erros
- `LOG_PERFORMANCE` - Log de performance

## 🔒 Segurança

### ⚠️ **IMPORTANTE**
- ✅ **Arquivo `.env` NÃO deve ser commitado** (já está no .gitignore)
- ✅ **Use `.env.example` para documentar variáveis**
- ✅ **Em produção, use variáveis de ambiente do Vercel**

### 🛡️ **Boas Práticas**
1. Nunca compartilhe arquivos `.env`
2. Use valores diferentes para desenvolvimento/produção
3. Mantenha backups seguros das configurações
4. Revise periodicamente as configurações de segurança

## 🧪 Teste da Configuração

Para testar se tudo está funcionando:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm start

# 3. Testar health check
curl http://localhost:3001/health

# 4. Testar API
curl -X POST http://localhost:3001/api \
  -H "Content-Type: application/json" \
  -d '{"imeiList":["123456789012345"]}'
```

## 📈 Monitoramento

### Logs Importantes
```bash
# Ver configuração carregada
npm start | grep "🚀\|📍\|🔑"

# Ver requisições
npm start | grep "Proxy:"

# Ver erros
npm start | grep "❌"
```

### Health Check
- **URL**: `http://localhost:3001/health`
- **Retorna**: Status do servidor e configurações

## 🔄 Atualizações

Para atualizar configurações:

1. **Desenvolvimento**: Edite o arquivo `.env`
2. **Produção**: Atualize no dashboard do Vercel
3. **Reinicie o servidor** para aplicar mudanças

---

**Sistema Allcom JC450 configurado e pronto para uso! 🎉**
