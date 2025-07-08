# Allcom JC450 - Versão para Produção Oracle

## O que manter no deploy:

- index.html
- login.html
- help.html
- css/ (apenas styles.css e login.css)
- js/ (apenas arquivos de funcionalidade, pode remover debug-session.js, system-test.js, test-system.js)
- users.json
- favicon.svg
- package.json, package-lock.json (se usar proxy-server.js)
- proxy-server.js (se usar proxy)

## O que REMOVER antes de subir para produção:

- Todos os arquivos de documentação interna, testes, exemplos, debug, .env, .git, .vscode, .github
- Arquivos listados em ARQUIVOS-PARA-REMOVER.txt

## Observação

Mantenha apenas o essencial para o funcionamento do sistema. Documentação sensível e arquivos de teste não devem ser enviados para produção.
