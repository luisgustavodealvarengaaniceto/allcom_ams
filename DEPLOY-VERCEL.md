# Allcom JC450 - Deploy no Vercel

## 📋 Pré-requisitos

1. **Conta no Vercel**: Crie uma conta gratuita em [vercel.com](https://vercel.com)
2. **Git instalado**: Para versionamento do código
3. **GitHub/GitLab/Bitbucket**: Para hospedar o repositório (opcional, mas recomendado)

## 🚀 Opções de Deploy

### Opção 1: Deploy via CLI (Recomendado)

1. **Instalar Vercel CLI**:
```bash
npm install -g vercel
```

2. **Fazer login no Vercel**:
```bash
vercel login
```

3. **Na pasta do projeto, executar**:
```bash
vercel
```

4. **Seguir as instruções**:
   - Project name: `allcom-jc450`
   - Deploy to production: `Y`

### Opção 2: Deploy via GitHub

1. **Criar repositório no GitHub**:
   - Vá para [github.com](https://github.com)
   - Clique em "New repository"
   - Nome: `allcom-jc450`
   - Marque como público ou privado

2. **Enviar código para o GitHub**:
```bash
git init
git add .
git commit -m "Initial commit - Allcom JC450 System"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/allcom-jc450.git
git push -u origin main
```

3. **Conectar Vercel ao GitHub**:
   - Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
   - Clique em "New Project"
   - Importe o repositório `allcom-jc450`
   - Configure:
     - Framework Preset: `Other`
     - Root Directory: `./`
     - Build Command: (deixe vazio)
     - Output Directory: `./`

### Opção 3: Deploy Manual (Upload)

1. **Acesse [vercel.com/new](https://vercel.com/new)**
2. **Arraste a pasta do projeto** ou selecione os arquivos
3. **Configure**:
   - Project Name: `allcom-jc450`
   - Framework: `Other`

## ⚙️ Configurações Importantes

### Variáveis de Ambiente (Opcional)

Se quiser adicionar configurações extras:

1. No dashboard do Vercel
2. Vá em Settings > Environment Variables
3. Adicione:
   - `NODE_ENV`: `production`
   - `API_TIMEOUT`: `30000`

### Domínio Personalizado (Opcional)

1. No dashboard do Vercel
2. Vá em Settings > Domains
3. Adicione seu domínio personalizado
4. Configure DNS conforme instruções

## 📁 Estrutura de Deploy

O sistema foi configurado com:

```
allcom_jc450/
├── api/
│   └── proxy.js          # Servidor proxy para API JimiCloud
├── css/
│   └── styles.css        # Estilos da aplicação
├── js/
│   ├── app.js           # Aplicação principal
│   ├── firmware-manager.js
│   ├── export-manager.js
│   └── ...              # Outros módulos
├── index.html           # Página principal
├── help.html           # Página de ajuda
├── vercel.json         # Configuração do Vercel
└── package.json        # Dependências Node.js
```

## 🔗 URLs de Acesso

Após o deploy, você terá:

- **URL Principal**: `https://allcom-jc450.vercel.app`
- **API Proxy**: `https://allcom-jc450.vercel.app/api/proxy`
- **Ajuda**: `https://allcom-jc450.vercel.app/help.html`

## 🛠️ Solução de Problemas

### Erro de Build
Se houver erro de build, verifique:
- Arquivos `package.json` e `vercel.json` estão corretos
- Não há caracteres especiais nos nomes de arquivos

### Erro 404 na API
- Verifique se o arquivo `api/proxy.js` existe
- Teste a URL: `https://SEU_DOMINIO.vercel.app/api/proxy`

### CORS Error
- O proxy já está configurado com CORS
- Se persistir, verifique se está usando a URL correta da API

### Timeout
- O timeout está configurado para 30 segundos
- Para consultas com muitos IMEIs, divida em lotes menores

## 📊 Monitoramento

No dashboard do Vercel você pode:
- Ver logs de acesso
- Monitorar performance
- Verificar uso de bandwidth
- Acompanhar deploys

## 🔄 Atualizações

### Via Git (Automático)
Se conectou via GitHub, toda atualização no repositório será automaticamente deployada.

### Via CLI
```bash
vercel --prod
```

### Manual
Faça upload dos arquivos atualizados no dashboard.

## 💡 Dicas

1. **Performance**: O Vercel tem CDN global automático
2. **SSL**: HTTPS é configurado automaticamente
3. **Logs**: Use `vercel logs` para ver logs em tempo real
4. **Preview**: Toda branch gera uma URL de preview automática

## 📞 Suporte

- **Documentação Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Suporte Vercel**: [vercel.com/support](https://vercel.com/support)
- **Status**: [vercel-status.com](https://vercel-status.com)

---

**Sistema Allcom JC450** - Deploy configurado para máxima performance e confiabilidade! 🚀
