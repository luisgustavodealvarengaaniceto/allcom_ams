<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Allcom JC450 - Sistema de Consulta de Status de Equipamentos

## Contexto do Projeto
Este é um sistema web profissional para consulta de status de equipamentos via IMEI, integrado com a API da JimiCloud. O sistema permite verificar o firmware, status de conectividade e informações técnicas detalhadas dos equipamentos Allcom JC450.

## Tecnologias Utilizadas
- HTML5 semântico e acessível
- CSS3 com design responsivo e moderno
- JavaScript vanilla (ES6+) para máxima compatibilidade
- Font Awesome para ícones
- Google Fonts (Inter) para tipografia

## Funcionalidades Principais
- Validação e processamento de IMEIs em lote (até 100 por requisição)
- Integração com API JimiCloud para consulta de status
- Conversão de fuso horário (China para Brasil)
- Cálculo de dias offline
- Interface responsiva para desktop, tablet e mobile
- Modal detalhado com todas as informações do equipamento
- Sistema de filtros e busca
- Notificações toast para feedback do usuário

## Padrões de Código
- Use JavaScript moderno (ES6+) com async/await
- Mantenha código limpo e bem documentado
- Implemente tratamento de erros robusto
- Use nomenclatura descritiva em português para variáveis e funções
- Mantenha separação clara entre HTML, CSS e JavaScript
- Priorize acessibilidade e responsividade

## API Integration
- Endpoint: http://fota-api.jimicloud.com/queryDeviceStatus
- Autenticação via Bearer token
- Processamento em lotes de 100 IMEIs
- Tratamento de erros e timeout
- Conversão de timezone China → Brasil

## Estrutura de Dados
- Foco na versão do firmware (version ou selfCheckParam)
- Cálculo de status online/offline baseado em lastTime
- Parser para selfCheckParam com informações detalhadas
