# Instruções para Rodar o Servidor Proxy (Resolver CORS)

## Problema
A API JimiCloud pode bloquear requisições diretas do navegador devido à política CORS (Cross-Origin Resource Sharing).

## Solução
Use o servidor proxy incluído para contornar as limitações de CORS.

## Como Usar

### 1. Instalar Node.js
- Baixe e instale Node.js do site oficial: https://nodejs.org/
- Versão recomendada: 16 ou superior

### 2. Instalar Dependências
Abra o terminal/prompt de comando na pasta do projeto e execute:
```bash
npm install
```

### 3. Iniciar o Servidor Proxy
```bash
npm start
```

O servidor irá rodar na porta 3001. Você verá a mensagem:
```
Servidor proxy rodando na porta 3001
Endpoint: http://localhost:3001/api/queryDeviceStatus
```

### 4. Usar o Sistema
- Mantenha o servidor proxy rodando em uma janela do terminal
- Abra o arquivo `index.html` no navegador
- O sistema tentará usar automaticamente o servidor proxy

## Verificar se Está Funcionando
- Console do navegador mostrará: "Tentando usar servidor proxy local..."
- Em caso de sucesso: "Sucesso via proxy: X resultados retornados"

## Alternativas se o Proxy Não Funcionar
1. **Extensão do Navegador**: Instale uma extensão para desabilitar CORS (apenas para desenvolvimento)
2. **Servidor Web Local**: Use um servidor web local (Live Server, http-server, etc.)
3. **Configurar CORS na API**: Configure CORS no servidor da API JimiCloud

## Troubleshooting
- **Erro "Servidor proxy não está rodando"**: Execute `npm start` novamente
- **Porta 3001 em uso**: Mude a porta no arquivo `proxy-server.js`
- **Erro de instalação npm**: Verifique se o Node.js está instalado corretamente

## Arquivos do Proxy
- `proxy-server.js`: Código do servidor proxy
- `package.json`: Configurações e dependências
- Este arquivo: Instruções de uso
