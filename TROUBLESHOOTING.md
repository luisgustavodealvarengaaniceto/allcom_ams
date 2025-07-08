# Solução de Problemas - Allcom JC450

## 🚨 Problemas Comuns e Soluções

### 1. Erro "Identifier 'cacheManager' has already been declared"

**Causa**: Cache do navegador com versões antigas dos scripts.

**Solução**:
```javascript
// Execute no console do navegador:
window.resetSystem.clearAllCaches()
```

**Ou**:
1. Pressione `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac) para refresh forçado
2. Ou abra DevTools (F12) > Network > marque "Disable cache" e recarregue

### 2. Modal de Detalhes Abrindo Automaticamente

**Causa**: JavaScript sendo executado múltiplas vezes.

**Solução**:
```javascript
// No console:
window.resetSystem.forceRefresh()
```

### 3. Firmware Manager Não Inicializa

**Causa**: Ordem de carregamento dos scripts ou elementos DOM não encontrados.

**Verificação**:
```javascript
// No console:
console.log('Firmware Manager:', window.firmwareManager);
console.log('Elements:', {
    select: document.getElementById('firmwareSelect'),
    display: document.getElementById('currentFirmwareDisplay')
});
```

**Solução**:
1. Recarregue a página
2. Se persistir, limpe o cache: `window.resetSystem.clearAllCaches()`

### 4. Sistema Lento ou Não Responsivo

**Causa**: Acúmulo de dados em cache ou memory leaks.

**Solução**:
```javascript
// Limpe apenas o cache da aplicação:
window.resetSystem.clearLocalStorage()

// Ou limpe tudo:
window.resetSystem.clearAllCaches()
```

### 5. Dados de Firmware Não Salvam

**Causa**: Problemas no localStorage.

**Diagnóstico**:
```javascript
// Verificar localStorage:
Object.keys(localStorage).filter(key => key.startsWith('allcom_'))
```

**Solução**:
```javascript
// Reset específico do firmware:
localStorage.removeItem('allcom_custom_firmwares');
localStorage.removeItem('allcom_reference_firmware');
// Depois recarregue a página
```

## 🔧 Comandos de Debug

### Verificar Estado dos Managers
```javascript
console.log('Managers Status:', {
    cache: !!window.cacheManager,
    performance: !!window.performanceManager,
    dashboard: !!window.dashboardManager,
    export: !!window.exportManager,
    firmware: !!window.firmwareManager
});
```

### Verificar Dados Armazenados
```javascript
// Firmware customizados
console.log('Custom Firmwares:', JSON.parse(localStorage.getItem('allcom_custom_firmwares') || '[]'));

// Firmware de referência
console.log('Reference Firmware:', localStorage.getItem('allcom_reference_firmware'));

// Cache de resultados
Object.keys(localStorage).filter(key => key.includes('query_result')).forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)));
});
```

### Forçar Re-inicialização
```javascript
// Limpar estado e reinicializar
window.allcomAppInitialized = false;
window.resetSystem.clearAllCaches();
```

## 🛠️ Reset Completo do Sistema

Se nada funcionar, execute esta sequência:

```javascript
// 1. Limpar tudo
window.resetSystem.clearAllCaches();

// 2. Ou manualmente:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

## 📝 Logs de Debug

Para ativar logs detalhados:

```javascript
// No console antes de usar o sistema:
localStorage.setItem('allcom_debug', 'true');
```

Para desativar:
```javascript
localStorage.removeItem('allcom_debug');
```

## 🔍 Verificação de Integridade

Execute este script para verificar se tudo está funcionando:

```javascript
function checkSystemIntegrity() {
    const checks = {
        'DOM Elements': !!document.getElementById('firmwareSelect'),
        'Managers Loaded': !!window.FirmwareManager,
        'App Initialized': !!window.allcomAppInitialized,
        'LocalStorage Access': (() => {
            try { localStorage.setItem('test', 'test'); localStorage.removeItem('test'); return true; } 
            catch { return false; }
        })()
    };
    
    console.table(checks);
    return Object.values(checks).every(Boolean);
}

checkSystemIntegrity();
```

## 📞 Suporte

Se os problemas persistirem:

1. Abra DevTools (F12)
2. Vá para Console
3. Execute `checkSystemIntegrity()`
4. Copie todos os logs e erros
5. Reporte o problema com as informações coletadas

## 🔄 Atualizações

Sempre que atualizar o código:

1. Execute `window.resetSystem.clearAllCaches()`
2. Ou use Ctrl+Shift+R para refresh forçado
3. Verifique se não há erros no console
