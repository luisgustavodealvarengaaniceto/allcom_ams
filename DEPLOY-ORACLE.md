# 🚀 Deploy Oracle Cloud - Allcom JC450

## 📋 **Opções de Deploy na Oracle**

### **1️⃣ Oracle Cloud Infrastructure (OCI) - Compute Instance**

#### **Configuração VM:**
- **Shape**: VM.Standard.E2.1.Micro (Free Tier)
- **OS**: Ubuntu 20.04 LTS
- **Network**: Criar VCN com subnet pública
- **Security**: Libertar portas 80, 443, 3001

#### **Comandos de Setup:**
```bash
# Conectar via SSH
ssh -i sua-chave.key opc@IP_PUBLICO

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

### **2️⃣ Oracle Functions (Serverless)**

#### **Setup:**
```bash
# Instalar OCI CLI
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Configurar OCI CLI
oci setup config

# Instalar Fn CLI
curl -LSs https://raw.githubusercontent.com/fnproject/cli/master/install | sh

# Configurar Fn
fn create context oracle-context --provider oracle
fn use context oracle-context
```

### **3️⃣ Oracle Container Engine (Kubernetes)**

#### **Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000 3001
CMD ["npm", "start"]
```

## 🔧 **Deploy Recomendado: Compute Instance**

### **Passo 1: Preparar Arquivos**
```bash
# No seu computador local
# Compactar projeto
tar -czf allcom-jc450.tar.gz allcom_jc450/

# Enviar para Oracle
scp -i sua-chave.key allcom-jc450.tar.gz opc@IP_PUBLICO:~/
```

### **Passo 2: Configurar Servidor**
```bash
# No servidor Oracle
cd ~
tar -xzf allcom-jc450.tar.gz
cd allcom_jc450

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Editar conforme necessário

# Testar aplicação
npm start
```

### **Passo 3: Configurar Nginx**
```bash
# Criar configuração Nginx
sudo nano /etc/nginx/sites-available/allcom-jc450
```

**Conteúdo do arquivo:**
```nginx
server {
    listen 80;
    server_name SEU_IP_OU_DOMINIO;

    # Frontend estático
    location / {
        root /home/opc/allcom_jc450;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # Proxy para API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/allcom-jc450 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Passo 4: Configurar PM2**
```bash
# Iniciar aplicação com PM2
pm2 start proxy-server.js --name "allcom-proxy"

# Configurar para iniciar automaticamente
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs allcom-proxy
```

### **Passo 5: Configurar Firewall**
```bash
# Oracle Cloud Console
# Ir para: Networking → Virtual Cloud Networks → Sua VCN → Security Lists
# Adicionar regras:
# - Ingress: 0.0.0.0/0, TCP, 80
# - Ingress: 0.0.0.0/0, TCP, 443

# No servidor (iptables)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## 🌐 **Configurar Domínio (Opcional)**

### **DNS:**
```
Tipo: A
Nome: @
Valor: IP_PUBLICO_ORACLE

Tipo: CNAME  
Nome: www
Valor: SEU_DOMINIO.com
```

### **SSL Certificate (Let's Encrypt):**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 **Monitoramento**

### **PM2 Monitoring:**
```bash
# Ver logs em tempo real
pm2 logs --lines 200

# Monitoramento web
pm2 plus
```

### **Nginx Logs:**
```bash
# Logs de acesso
sudo tail -f /var/log/nginx/access.log

# Logs de erro
sudo tail -f /var/log/nginx/error.log
```

## 🔧 **Comandos Úteis**

```bash
# Reiniciar aplicação
pm2 restart allcom-proxy

# Atualizar código
cd ~/allcom_jc450
git pull origin main  # Se usar Git
npm install
pm2 restart allcom-proxy

# Backup
tar -czf backup-$(date +%Y%m%d).tar.gz allcom_jc450/

# Ver status do sistema
pm2 status
sudo systemctl status nginx
df -h  # Espaço em disco
free -m  # Memória
```

## 💰 **Custos Oracle Cloud**

- **Compute Instance (Micro)**: Free Tier permanente
- **Network**: 10TB/mês grátis
- **Storage**: 200GB grátis
- **IP Público**: Grátis para primeira instância

## 🎯 **URLs Finais**

Após deploy você terá:
- **Site**: `http://SEU_IP_ORACLE` ou `https://SEU_DOMINIO.com`
- **API**: `http://SEU_IP_ORACLE/api/` ou `https://SEU_DOMINIO.com/api/`

---

**Sistema Allcom JC450 pronto para Oracle Cloud! 🌟**
