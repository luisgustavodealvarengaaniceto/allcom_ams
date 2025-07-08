# Allcom JC450 - Sistema de Consulta de Status de Equipamentos

Um sistema web profissional para consulta de status de equipamentos via IMEI, integrado com a API da JimiCloud.

## 🚀 Características Principais

- **Interface Responsiva**: Design moderno e responsivo que funciona em desktop, tablet e mobile
- **Consulta em Lote**: Suporte para até 100 IMEIs por requisição, com processamento automático em lotes
- **Dashboard Analítico**: Visualização de métricas, gráficos e estatísticas em tempo real
- **Exportação de Dados**: Suporte para CSV, Excel e JSON com metadados completos
- **Cache Inteligente**: Sistema de cache para tokens, resultados e preferências do usuário
- **Performance Otimizada**: Circuit breaker, retry inteligente e monitoramento de performance
- **Informações Detalhadas**: Exibição completa de firmware, status de conectividade, e dados do cartão SD
- **Conversão de Fuso Horário**: Conversão automática do horário da China para o fuso horário de Brasília
- **Cálculo de Status**: Determinação automática se o equipamento está online ou há quantos dias está offline
- **Filtros Avançados**: Sistema de filtros por status e busca por IMEI
- **Modal Detalhado**: Visualização completa de todas as informações do equipamento

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: JimiCloud FOTA API
- **Design**: Font Awesome, Google Fonts (Inter)
- **Compatibilidade**: Todos os navegadores modernos

## 📋 Funcionalidades

### Consulta de Equipamentos
- Validação automática de IMEIs (15 dígitos)
- Processamento em lotes de até 100 IMEIs
- Barra de progresso para acompanhamento
- Tratamento de erros robusto

### Informações Exibidas
- **IMEI do equipamento**
- **Versão do firmware** (extraída de `version` ou `selfCheckParam`)
- **Status de conectividade** (Online/Offline)
- **Última comunicação** (convertida para horário de Brasília)
- **Dias offline** (calculado automaticamente)
- **Informações técnicas completas**

### Interface
- Design responsivo e moderno
- Filtros por status (Todos/Online/Offline)
- Busca por IMEI específico
- Modal com detalhes completos do equipamento
- Notificações toast para feedback

## 🔧 Configuração

### Credenciais da API
```javascript
const API_CONFIG = {
    endpoint: 'http://fota-api.jimicloud.com',
    appKey: 'Jimiiotbrasil',
    secret: '23dd6cca658b4ec298aeb7beb4972fd4',
    maxBatchSize: 100
};
```

### Estrutura do Projeto
```
allcom_jc450/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── app.js          # Lógica JavaScript
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## 🚀 Como Usar

### Opção 1: Com Servidor Proxy (Recomendado)
1. **Instalar Node.js**: Baixe do site oficial nodejs.org
2. **Instalar dependências**: Execute `npm install` no terminal
3. **Iniciar proxy**: Execute `npm start` para resolver problemas de CORS
4. **Usar o sistema**: Abra `index.html` no navegador

### Opção 2: Sem Servidor Proxy
1. **Abrir diretamente**: Abra `index.html` no navegador
2. **Se houver erro CORS**: Use extensão do navegador ou servidor local
3. **Consultar dados**: O sistema tentará acessar a API diretamente

### Inserindo IMEIs
1. **Manual**: Digite os IMEIs na caixa de texto, um por linha
2. **Arquivo**: Clique em "Carregar arquivo .txt" para importar listas grandes
3. **Validação**: O sistema filtra automaticamente IMEIs válidos (15 dígitos)

### Processamento
- **Lotes automáticos**: Para mais de 100 IMEIs, divisão automática em lotes
- **Progresso detalhado**: Acompanhe cada lote sendo processado
- **Resultados**: Visualize status, firmware e informações técnicas

## 📊 Dados da API

### Endpoint de Consulta
```
POST http://fota-api.jimicloud.com/queryDeviceStatus
```

### Estrutura da Requisição
```json
{
  "imeiList": [
    "868120302622664",
    "868120302622665"
  ]
}
```

### Estrutura da Resposta
```json
{
  "imei": "869247060051882",
  "version": "C450Pro_2.0.08_20241028",
  "server": "164.152.62.67:21122,NA:NA",
  "csq": "-98dbm 17asu",
  "iccid": "89557400011234561625",
  "log": "NETWORK:4g Connected...",
  "firstTime": "2023-08-14T05:41:27.000+00:00",
  "lastTime": "2025-07-03T01:06:57.000+00:00",
  "power": "21.21",
  "selfCheckParam": "IMEI:869247060051882; VERSION:C450Pro_2.0.08_20241028..."
}
```

## 🔍 Processamento de Dados

### Extração da Versão do Firmware
1. Primeiro, verifica o campo `version`
2. Se não disponível, extrai de `selfCheckParam` usando regex: `VERSION:([^;]+)`

### Cálculo de Status Online/Offline
- **Online**: Última comunicação há menos de 24 horas
- **Offline**: Calcula quantos dias desde a última comunicação
- **Conversão de Timezone**: UTC (China) → UTC-3 (Brasília)

### Parsing de Parâmetros
- Extrai informações detalhadas de `selfCheckParam`
- Converte string delimitada por ponto-vírgula em objeto estruturado

## 🎨 Design e UX

### Responsividade
- **Desktop**: Layout com múltiplas colunas
- **Tablet**: Layout adaptado para telas médias
- **Mobile**: Layout em coluna única, otimizado para toque

### Acessibilidade
- Estrutura HTML semântica
- Contraste adequado de cores
- Navegação por teclado
- Labels descritivos

### Feedback Visual
- Estados de loading com progress bar
- Notificações toast para sucesso/erro
- Indicadores visuais de status (online/offline)
- Animações suaves para melhor UX

## 🔒 Segurança

- Validação rigorosa de IMEIs
- Tratamento seguro de erros da API
- Sanitização de dados antes da exibição
- Timeout em requisições para evitar travamentos

## 📱 Compatibilidade

- **Navegadores**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Dispositivos**: Desktop, Tablet, Smartphone
- **Sistemas**: Windows, macOS, Linux, iOS, Android

## 🐛 Tratamento de Erros

- Validação de entrada (IMEIs inválidos)
- Erros de conectividade com a API
- Timeouts de requisição
- Dados malformados da API
- Feedback claro para o usuário

## 📈 Performance

- JavaScript vanilla para máxima performance
- CSS otimizado com seletores eficientes
- Lazy loading de dados quando apropriado
- Debounce em filtros para evitar requests excessivos

## 🔄 Atualizações Futuras

- [ ] Cache de resultados para melhor performance
- [ ] Exportação de dados (CSV, Excel)
- [ ] Histórico de consultas
- [ ] Dashboard com estatísticas
- [ ] API para integração com outros sistemas

---

**Desenvolvido para Allcom** - Sistema de monitoramento profissional para equipamentos JC450
