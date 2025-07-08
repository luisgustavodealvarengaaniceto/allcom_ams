#!/bin/bash
# start-oracle.sh - Script para iniciar aplicação na Oracle Cloud
# Coloque este script na pasta raiz da aplicação e torne-o executável:
# chmod +x start-oracle.sh

# Variáveis de ambiente
export NODE_ENV=production
export PORT=8080  # Porta padrão Oracle Apps ou ajuste conforme necessário
export HOST=0.0.0.0  # Aceitar conexões de qualquer IP

# Iniciar aplicação
echo "📣 Iniciando Allcom JC450 em modo produção (Oracle Cloud)..."
echo "🔧 Porta: $PORT"
echo "🔧 Ambiente: $NODE_ENV"

# Verificar existência do arquivo .env
if [ ! -f ".env" ]; then
    echo "⚠️ Arquivo .env não encontrado!"
    echo "⚠️ Criando .env a partir de .env.production.example..."
    
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env
        echo "✅ Arquivo .env criado com sucesso!"
    else
        echo "❌ ERRO: .env.production.example não encontrado!"
        echo "❌ Crie um arquivo .env manualmente antes de continuar."
        exit 1
    fi
fi

# Verificar e instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install --production
    echo "✅ Dependências instaladas com sucesso!"
fi

# Iniciar servidor
echo "🚀 Iniciando servidor..."
node proxy-server.js
