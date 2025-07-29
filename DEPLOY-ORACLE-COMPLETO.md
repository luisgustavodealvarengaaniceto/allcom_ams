# Deploy Completo na Oracle - Allcom JC450

## Informações da Máquina
- **IP Público**: 137.131.170.156
- **Porta**: 80 (HTTP)
- **Acesso**: Via Termius SSH

## Pré-requisitos no Servidor Oracle

### 1. Conectar via Termius
```bash
# Conectar via SSH (substitua 'usuario' pelo seu usuário)
ssh usuario@137.131.170.156

# Se usar chave SSH, adicione no Termius
```

### 2. Instalar Node.js (se não estiver instalado)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar PM2 (Gerenciador de Processos)
```bash
sudo npm install -g pm2
```

### 4. Instalar Nginx (Proxy Reverso)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx

# Verificar se está rodando
sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Preparação dos Arquivos

### 1. Criar Diretório do Projeto
```bash
sudo mkdir -p /var/www/allcom-jc450
sudo chown $USER:$USER /var/www/allcom-jc450
cd /var/www/allcom-jc450
```

### 2. Transferir Arquivos
Você pode usar uma das opções:

#### Opção A: Via Git (Recomendado)
```bash
git clone https://github.com/luisgustavodealvarengaaniceto/allcom_ams.git .
```

#### Opção B: Via SCP/SFTP no Termius
No Termius, use SFTP para transferir os arquivos:
- Conecte via SFTP
- Navegue até `/var/www/allcom-jc450`
- Faça upload de todos os arquivos do projeto

#### Opção C: Via rsync (do seu Windows)
```bash
# No PowerShell (do seu computador)
rsync -avz --exclude 'node_modules' --exclude '.git' "c:\Users\LuisGustavo\OneDrive - Newtec Telemetria\Documentos\allcom_jc450\*" usuario@137.131.170.156:/var/www/allcom-jc450/
```

### 3. Instalar Dependências
```bash
cd /var/www/allcom-jc450
npm install
```

## Configuração do Sistema

### 1. Criar Arquivo de Configuração de Produção
```bash
cat > production-config.js << 'EOF'
// Configuração de produção para Oracle
const config = {
    port: process.env.PORT || 3000,
    environment: 'production',
    cors: {
        origin: ['http://137.131.170.156', 'https://137.131.170.156'],
        credentials: true
    },
    api: {
        jimicloud: {
            baseUrl: 'http://fota-api.jimicloud.com',
            timeout: 30000,
            retries: 3
        }
    },
    server: {
        host: '0.0.0.0',
        compression: true,
        security: {
            helmet: true,
            rateLimiting: true
        }
    }
};

module.exports = config;
EOF
```

### 2. Configurar PM2
```bash
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
    watch: false
  }]
};
EOF
```

### 3. Criar Diretório de Logs
```bash
mkdir -p logs
```

## Configuração do Nginx

### 1. Criar Configuração do Site
```bash
sudo cat > /etc/nginx/sites-available/allcom-jc450 << 'EOF'
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
    
    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF
```

### 2. Habilitar o Site
```bash
sudo ln -s /etc/nginx/sites-available/allcom-jc450 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Deploy e Inicialização

### 1. Iniciar Aplicação com PM2
```bash
cd /var/www/allcom-jc450
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Verificar Status
```bash
pm2 status
pm2 logs allcom-jc450 --lines 50
```

### 3. Testar Aplicação
```bash
# Testar proxy local
curl http://localhost:3000/api/test

# Testar via nginx
curl http://137.131.170.156/
```

## Verificações de Funcionamento

### 1. Verificar Serviços
```bash
# Nginx
sudo systemctl status nginx

# PM2
pm2 status

# Portas abertas
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
```

### 2. Verificar Logs
```bash
# Logs do PM2
pm2 logs allcom-jc450

# Logs do Nginx
sudo tail -f /var/log/nginx/allcom-jc450.access.log
sudo tail -f /var/log/nginx/allcom-jc450.error.log
```

### 3. Testar no Navegador
- Acesse: `http://137.131.170.156`
- Teste a funcionalidade de consulta de IMEI
- Verifique se não há erros no console do navegador

## Manutenção e Monitoramento

### 1. Comandos Úteis do PM2
```bash
# Reiniciar aplicação
pm2 restart allcom-jc450

# Parar aplicação
pm2 stop allcom-jc450

# Ver logs em tempo real
pm2 logs allcom-jc450 --lines 100

# Monitoramento
pm2 monit
```

### 2. Backup e Atualização
```bash
# Backup do projeto
sudo tar -czf /tmp/allcom-jc450-backup-$(date +%Y%m%d).tar.gz /var/www/allcom-jc450

# Atualizar código (via git)
cd /var/www/allcom-jc450
git pull origin main
npm install
pm2 restart allcom-jc450
```

### 3. Monitoramento de Recursos
```bash
# Ver uso de CPU e memória
top
htop

# Ver espaço em disco
df -h

# Ver conexões ativas
sudo netstat -an | grep :80
```

## Firewall (se necessário)

```bash
# Ubuntu UFW
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS/RHEL firewalld
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

## Resolução de Problemas

### 1. Se a aplicação não iniciar
```bash
# Verificar logs
pm2 logs allcom-jc450 --lines 50

# Verificar se o Node.js está funcionando
node --version

# Testar o proxy diretamente
cd /var/www/allcom-jc450
node proxy-server.js
```

### 2. Se o Nginx não funcionar
```bash
# Verificar configuração
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar nginx
sudo systemctl restart nginx
```

### 3. Se não conseguir acessar externamente
```bash
# Verificar se está ouvindo na porta correta
sudo netstat -tlnp | grep :80

# Verificar firewall
sudo iptables -L
sudo ufw status
```

## URLs de Acesso

- **Site Principal**: http://137.131.170.156
- **Login**: http://137.131.170.156/login.html
- **Help**: http://137.131.170.156/help.html
- **API Test**: http://137.131.170.156/api/test

## Notas Importantes

1. **Backup Regular**: Configure backups automáticos
2. **Monitoramento**: Use `pm2 monit` para monitorar a aplicação
3. **Logs**: Monitore os logs regularmente para identificar problemas
4. **Atualizações**: Mantenha o sistema atualizado
5. **Segurança**: Configure SSL/HTTPS quando possível
6. **Performance**: Monitore uso de CPU e memória

## Scripts de Manutenção

### Script de Deploy Rápido
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/allcom-jc450
echo "Fazendo backup..."
sudo tar -czf /tmp/allcom-jc450-backup-$(date +%Y%m%d-%H%M).tar.gz .
echo "Atualizando código..."
git pull origin main
echo "Instalando dependências..."
npm install
echo "Reiniciando aplicação..."
pm2 restart allcom-jc450
echo "Deploy concluído!"
pm2 status
EOF

chmod +x deploy.sh
```

### Script de Monitoramento
```bash
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== Status dos Serviços ==="
sudo systemctl status nginx --no-pager
pm2 status
echo ""
echo "=== Uso de Recursos ==="
df -h /
free -h
echo ""
echo "=== Últimos Logs ==="
pm2 logs allcom-jc450 --lines 10 --nostream
EOF

chmod +x monitor.sh
```
