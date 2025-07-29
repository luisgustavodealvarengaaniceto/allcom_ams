#!/bin/bash

# Script de Deploy Automatizado - Oracle Cloud
# Allcom JC450 System

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis de configuração
PROJECT_DIR="/var/www/allcom-jc450"
NGINX_SITE="allcom-jc450"
PM2_APP="allcom-jc450"
BACKUP_DIR="/tmp/backups"

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para instalar Node.js
install_nodejs() {
    print_status "Instalando Node.js..."
    
    if command_exists apt-get; then
        # Ubuntu/Debian
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command_exists yum; then
        # CentOS/RHEL
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    else
        print_error "Sistema operacional não suportado"
        exit 1
    fi
    
    print_success "Node.js instalado: $(node --version)"
}

# Função para instalar PM2
install_pm2() {
    print_status "Instalando PM2..."
    sudo npm install -g pm2
    print_success "PM2 instalado: $(pm2 --version)"
}

# Função para instalar Nginx
install_nginx() {
    print_status "Instalando Nginx..."
    
    if command_exists apt-get; then
        sudo apt update
        sudo apt install -y nginx
    elif command_exists yum; then
        sudo yum install -y epel-release
        sudo yum install -y nginx
    fi
    
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx instalado e iniciado"
}

# Função para criar diretórios necessários
create_directories() {
    print_status "Criando diretórios..."
    
    sudo mkdir -p $PROJECT_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $PROJECT_DIR/logs
    
    # Ajustar permissões
    sudo chown $USER:$USER $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR/logs
    
    print_success "Diretórios criados"
}

# Função para fazer backup
create_backup() {
    if [ -d "$PROJECT_DIR" ] && [ "$(ls -A $PROJECT_DIR)" ]; then
        print_status "Criando backup..."
        BACKUP_FILE="$BACKUP_DIR/allcom-jc450-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        sudo tar -czf $BACKUP_FILE -C $PROJECT_DIR .
        print_success "Backup criado: $BACKUP_FILE"
    fi
}

# Função para configurar o projeto
setup_project() {
    print_status "Configurando projeto..."
    
    cd $PROJECT_DIR
    
    # Se não existir package.json, criar um básico
    if [ ! -f "package.json" ]; then
        cat > package.json << 'EOF'
{
  "name": "allcom-jc450",
  "version": "1.0.0",
  "description": "Sistema de consulta Allcom JC450",
  "main": "proxy-server.js",
  "scripts": {
    "start": "node proxy-server.js",
    "dev": "nodemon proxy-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4"
  }
}
EOF
    fi
    
    # Instalar dependências se existir package.json
    if [ -f "package.json" ]; then
        print_status "Instalando dependências..."
        npm install
        print_success "Dependências instaladas"
    fi
}

# Função para configurar PM2
setup_pm2() {
    print_status "Configurando PM2..."
    
    cd $PROJECT_DIR
    
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'allcom-jc450',
    script: 'proxy-server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '1G'
  }]
};
EOF
    
    print_success "Configuração PM2 criada"
}

# Função para configurar Nginx
setup_nginx() {
    print_status "Configurando Nginx..."
    
    sudo cat > /etc/nginx/sites-available/$NGINX_SITE << 'EOF'
server {
    listen 80;
    server_name 137.131.170.156;
    
    # Logs
    access_log /var/log/nginx/allcom-jc450.access.log;
    error_log /var/log/nginx/allcom-jc450.error.log;
    
    # Diretório dos arquivos estáticos
    root /var/www/allcom-jc450;
    index index.html;
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Configurações de compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Arquivos estáticos
    location / {
        try_files $uri $uri/ =404;
        
        # Cache para arquivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Proxy para API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Bloquear arquivos sensíveis
    location ~* \.(env|log|sql|bak)$ {
        deny all;
        return 404;
    }
    
    # Bloquear diretórios sensíveis
    location ~ /\. {
        deny all;
        return 404;
    }
}
EOF
    
    # Remover site padrão se existir
    if [ -L /etc/nginx/sites-enabled/default ]; then
        sudo rm /etc/nginx/sites-enabled/default
    fi
    
    # Habilitar o site
    sudo ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/
    
    # Testar configuração
    if sudo nginx -t; then
        sudo systemctl reload nginx
        print_success "Nginx configurado e recarregado"
    else
        print_error "Erro na configuração do Nginx"
        exit 1
    fi
}

# Função para iniciar serviços
start_services() {
    print_status "Iniciando serviços..."
    
    cd $PROJECT_DIR
    
    # Parar PM2 se estiver rodando
    pm2 stop $PM2_APP 2>/dev/null || true
    pm2 delete $PM2_APP 2>/dev/null || true
    
    # Iniciar com PM2
    pm2 start ecosystem.config.js
    pm2 save
    
    # Configurar autostart
    pm2 startup systemd -u $USER --hp $HOME
    
    print_success "Serviços iniciados"
}

# Função para verificar status
check_status() {
    print_status "Verificando status dos serviços..."
    
    echo -e "\n${BLUE}=== Status Nginx ===${NC}"
    sudo systemctl status nginx --no-pager --lines=5
    
    echo -e "\n${BLUE}=== Status PM2 ===${NC}"
    pm2 status
    
    echo -e "\n${BLUE}=== Portas em uso ===${NC}"
    sudo netstat -tlnp | grep ':80\|:3000' || true
    
    echo -e "\n${BLUE}=== Teste de conectividade ===${NC}"
    if curl -s http://localhost:80 > /dev/null; then
        print_success "Nginx respondendo na porta 80"
    else
        print_warning "Nginx não está respondendo na porta 80"
    fi
    
    if curl -s http://localhost:3000/api/test > /dev/null 2>&1; then
        print_success "API respondendo na porta 3000"
    else
        print_warning "API não está respondendo na porta 3000"
    fi
}

# Função para exibir informações finais
show_final_info() {
    echo -e "\n${GREEN}=== DEPLOY CONCLUÍDO ===${NC}"
    echo -e "${BLUE}URLs de acesso:${NC}"
    echo "  • Site principal: http://137.131.170.156"
    echo "  • Login: http://137.131.170.156/login.html"
    echo "  • Help: http://137.131.170.156/help.html"
    echo ""
    echo -e "${BLUE}Comandos úteis:${NC}"
    echo "  • Ver logs: pm2 logs $PM2_APP"
    echo "  • Reiniciar: pm2 restart $PM2_APP"
    echo "  • Status: pm2 status"
    echo "  • Monitorar: pm2 monit"
    echo ""
    echo -e "${BLUE}Logs do sistema:${NC}"
    echo "  • PM2: $PROJECT_DIR/logs/"
    echo "  • Nginx: /var/log/nginx/allcom-jc450.*"
}

# Função principal
main() {
    print_status "Iniciando deploy do Allcom JC450..."
    
    # Verificar se está rodando como root
    if [ "$EUID" -eq 0 ]; then
        print_error "Este script não deve ser executado como root"
        exit 1
    fi
    
    # Verificar e instalar dependências
    if ! command_exists node; then
        install_nodejs
    else
        print_success "Node.js já instalado: $(node --version)"
    fi
    
    if ! command_exists pm2; then
        install_pm2
    else
        print_success "PM2 já instalado"
    fi
    
    if ! command_exists nginx; then
        install_nginx
    else
        print_success "Nginx já instalado"
    fi
    
    # Executar passos do deploy
    create_backup
    create_directories
    setup_project
    setup_pm2
    setup_nginx
    start_services
    
    # Aguardar um pouco antes de verificar
    sleep 3
    
    check_status
    show_final_info
    
    print_success "Deploy concluído com sucesso!"
}

# Verificar argumentos
case "${1:-}" in
    --help|-h)
        echo "Deploy automatizado do Allcom JC450"
        echo "Uso: $0 [opções]"
        echo ""
        echo "Opções:"
        echo "  --help, -h     Exibir esta ajuda"
        echo "  --status       Verificar apenas o status"
        echo "  --restart      Reiniciar apenas os serviços"
        echo ""
        exit 0
        ;;
    --status)
        check_status
        exit 0
        ;;
    --restart)
        print_status "Reiniciando serviços..."
        cd $PROJECT_DIR
        pm2 restart $PM2_APP
        sudo systemctl reload nginx
        check_status
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Opção inválida: $1"
        echo "Use $0 --help para ver as opções disponíveis"
        exit 1
        ;;
esac
