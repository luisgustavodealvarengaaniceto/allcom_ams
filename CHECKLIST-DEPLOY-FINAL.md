# Checklist de Deploy Final - Allcom JC450

## Etapa 1: Preparação
- [ ] Executar `node prepare-deploy.js` para criar pasta de deploy limpa
- [ ] Confirmar que a pasta `deploy-oracle` contém apenas os arquivos necessários
- [ ] Verificar se os arquivos de teste e debug foram removidos

## Etapa 2: Configuração
- [ ] Copiar `.env.production.example` para `.env` e ajustar valores:
  - [ ] API_ENDPOINT: https://fota-api.jimicloud.com
  - [ ] Definir CORS_ORIGIN para URL de produção
  - [ ] Definir SESSION_SECRET (gerar um valor seguro e único)
  - [ ] Ajustar PROXY_PORT conforme necessidade

## Etapa 3: Segurança
- [ ] Verificar se `production-config.js` está sendo carregado corretamente
- [ ] Confirmar que senhas em `users.json` são fortes e seguras
- [ ] Verificar configurações de CORS e cabeçalhos de segurança
- [ ] Configurar HTTPS (obrigatório para produção)

## Etapa 4: Deploy
- [ ] Fazer upload dos arquivos para o servidor Oracle
- [ ] Instalar dependências: `npm install --production`
- [ ] Tornar `start-oracle.sh` executável: `chmod +x start-oracle.sh`
- [ ] Iniciar aplicação: `./start-oracle.sh` ou `npm start`

## Etapa 5: Testes Pós-Deploy
- [ ] Testar login com diferentes usuários
- [ ] Verificar se carregamento de IMEIs funciona corretamente
- [ ] Confirmar que consultas à API retornam resultados esperados
- [ ] Testar filtros e exportação de dados
- [ ] Verificar visualização em diferentes dispositivos
- [ ] Confirmar que logs de produção estão silenciados

## Etapa 6: Monitoramento
- [ ] Configurar monitoramento de logs
- [ ] Estabelecer procedimento de backup para `users.json`
- [ ] Documentar URL final e procedimentos de manutenção
- [ ] Verificar que `console.error()` continua funcionando para erros críticos

## Notas Adicionais
- Todas as credenciais devem ser alteradas após o primeiro login
- Documente quaisquer alterações feitas durante o deploy
- Mantenha backups de todos os arquivos de configuração
