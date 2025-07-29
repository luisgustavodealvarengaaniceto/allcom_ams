# Comandos para Executar no Termius - Oracle Cloud
# IP: 137.131.170.156 | Porta: 80

## PASSO 1: Conectar via SSH no Termius
```
ssh usuario@137.131.170.156
```
*Substitua "usuario" pelo seu usuário na máquina Oracle*

## PASSO 2: Atualizar Sistema (Ubuntu/Debian)
```bash
sudo apt update && sudo apt upgrade -y
```

## PASSO 3: Instalar Git (se não estiver instalado)
```bash
sudo apt install git -y
```

## PASSO 4: Clonar/Transferir o Projeto

### Opção A: Via Git (mais fácil)
```bash
cd /tmp
git clone https://github.com/luisgustavodealvarengaaniceto/allcom_ams.git
sudo cp -r allcom_ams /var/www/allcom-jc450
sudo chown -R $USER:$USER /var/www/allcom-jc450
```

### Opção B: Via SFTP no Termius
1. No Termius, clique em "SFTP" na conexão
2. Navegue até `/var/www/`
3. Crie a pasta `allcom-jc450`
4. Faça upload de todos os arquivos do projeto

## PASSO 5: Executar Script de Deploy Automatizado
```bash
cd /var/www/allcom-jc450
chmod +x deploy-oracle.sh
./deploy-oracle.sh
```

## PASSO 6: Verificar se Tudo Funcionou
```bash
# Ver status dos serviços
pm2 status
sudo systemctl status nginx

# Testar conectividade
curl http://localhost
curl http://localhost:3000/api/test

# Ver logs se houver problema
pm2 logs allcom-jc450 --lines 20
```

## COMANDOS DE MANUTENÇÃO

### Ver Logs em Tempo Real
```bash
pm2 logs allcom-jc450
```

### Reiniciar Aplicação
```bash
pm2 restart allcom-jc450
```

### Reiniciar Nginx
```bash
sudo systemctl restart nginx
```

### Ver Status Completo
```bash
./deploy-oracle.sh --status
```

### Monitorar Recursos
```bash
pm2 monit
htop
```

## TESTE FINAL

Acesse no navegador: **http://137.131.170.156**

- ✅ Página deve carregar normalmente
- ✅ Consulta de IMEI deve funcionar
- ✅ Login deve funcionar (se configurado)

## SE ALGO DER ERRADO

### 1. Verificar Logs de Erro
```bash
# Logs da aplicação
pm2 logs allcom-jc450 --err --lines 50

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f
```

### 2. Verificar Portas
```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
```

### 3. Testar Diretamente
```bash
cd /var/www/allcom-jc450
node proxy-server.js
```

### 4. Verificar Firewall
```bash
sudo ufw status
sudo iptables -L
```

### 5. Reiniciar Tudo
```bash
pm2 restart allcom-jc450
sudo systemctl restart nginx
./deploy-oracle.sh --restart
```

## COMANDOS PARA ATUALIZAÇÃO FUTURA

### Atualizar Código
```bash
cd /var/www/allcom-jc450
git pull origin main
npm install
pm2 restart allcom-jc450
```

### Backup Antes de Atualizar
```bash
sudo tar -czf /tmp/allcom-backup-$(date +%Y%m%d).tar.gz /var/www/allcom-jc450
```

## MONITORAMENTO CONTÍNUO

### Script de Monitoramento Diário
```bash
cat > monitor-daily.sh << 'EOF'
#!/bin/bash
echo "=== Status $(date) ==="
pm2 status
df -h
free -h
sudo systemctl status nginx --no-pager
echo "========================"
EOF

chmod +x monitor-daily.sh
```

### Configurar Cron para Verificação Automática
```bash
crontab -e
# Adicionar linha:
0 */6 * * * /var/www/allcom-jc450/monitor-daily.sh >> /var/log/allcom-monitor.log
```

## CONFIGURAÇÃO DE SEGURANÇA (OPCIONAL)

### Configurar Firewall Básico
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw --force enable
```

### Configurar Fail2Ban (Proteção SSH)
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## URLs FINAIS DE ACESSO

- **Site Principal**: http://137.131.170.156
- **Login**: http://137.131.170.156/login.html  
- **Help**: http://137.131.170.156/help.html
- **API Test**: http://137.131.170.156/api/test

## SUPORTE

Se precisar de ajuda:
1. Verifique os logs: `pm2 logs allcom-jc450`
2. Execute: `./deploy-oracle.sh --status`
3. Reinicie: `./deploy-oracle.sh --restart`
