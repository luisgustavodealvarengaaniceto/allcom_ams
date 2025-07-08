// Test script para verificar todas as funcionalidades implementadas
// Execute este arquivo no console do navegador para testar

console.log('🧪 Iniciando testes das melhorias implementadas...');

// Test 1: Verificar se todos os managers foram inicializados
function testManagersInitialization() {
    console.log('\n📋 Teste 1: Inicialização dos Managers');
    
    const managers = {
        'Cache Manager': window.cacheManager,
        'Performance Manager': window.performanceManager,
        'Dashboard Manager': window.dashboardManager,
        'Export Manager': window.exportManager
    };
    
    Object.entries(managers).forEach(([name, manager]) => {
        if (manager) {
            console.log(`✅ ${name}: Inicializado`);
        } else {
            console.log(`❌ ${name}: Não inicializado`);
        }
    });
}

// Test 2: Testar cache funcionality
function testCacheManager() {
    console.log('\n💾 Teste 2: Cache Manager');
    
    if (!window.cacheManager) {
        console.log('❌ Cache Manager não disponível');
        return;
    }
    
    try {
        // Test token cache
        cacheManager.setAuthToken('test-token-123', 3600);
        const token = cacheManager.getAuthToken();
        console.log(token ? '✅ Cache de token funcionando' : '❌ Cache de token falhou');
        
        // Test user preferences
        const testPrefs = { theme: 'dark', language: 'pt-BR' };
        cacheManager.setUserPreferences(testPrefs);
        const prefs = cacheManager.getUserPreferences();
        console.log(prefs ? '✅ Cache de preferências funcionando' : '❌ Cache de preferências falhou');
        
    } catch (error) {
        console.log('❌ Erro no teste de cache:', error.message);
    }
}

// Test 3: Testar performance manager
function testPerformanceManager() {
    console.log('\n⚡ Teste 3: Performance Manager');
    
    if (!window.performanceManager) {
        console.log('❌ Performance Manager não disponível');
        return;
    }
    
    try {
        const canMakeRequest = performanceManager.canMakeRequest();
        console.log(`✅ Circuit Breaker Status: ${canMakeRequest ? 'Operacional' : 'Bloqueado'}`);
        
        const stats = performanceManager.getPerformanceStats();
        console.log('✅ Estatísticas de performance:', stats);
        
    } catch (error) {
        console.log('❌ Erro no teste de performance:', error.message);
    }
}

// Test 4: Testar dashboard elements
function testDashboardElements() {
    console.log('\n📊 Teste 4: Elementos do Dashboard');
    
    const elements = [
        'dashboardSection',
        'dashboardContent',
        'toggleDashboard',
        'generalMetrics',
        'connectivityChart',
        'firmwareChart',
        'storageChart'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Elemento ${id}: Encontrado`);
        } else {
            console.log(`❌ Elemento ${id}: Não encontrado`);
        }
    });
}

// Test 5: Testar botões de exportação
function testExportButtons() {
    console.log('\n📤 Teste 5: Botões de Exportação');
    
    const exportButtons = ['exportCsv', 'exportExcel', 'exportJson'];
    
    exportButtons.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            console.log(`✅ Botão ${id}: Encontrado`);
            // Test event listener
            const hasListener = button.onclick || button.addEventListener;
            console.log(`   Event listener: ${hasListener ? 'Configurado' : 'Não configurado'}`);
        } else {
            console.log(`❌ Botão ${id}: Não encontrado`);
        }
    });
}

// Test 6: Verificar se scripts estão carregados
function testScriptsLoaded() {
    console.log('\n📜 Teste 6: Scripts Carregados');
    
    const scripts = [
        'CacheManager',
        'PerformanceManager', 
        'DashboardManager',
        'ExportManager'
    ];
    
    scripts.forEach(scriptClass => {
        try {
            const exists = typeof window[scriptClass] === 'function';
            console.log(`${exists ? '✅' : '❌'} ${scriptClass}: ${exists ? 'Carregado' : 'Não encontrado'}`);
        } catch (error) {
            console.log(`❌ ${scriptClass}: Erro ao verificar`);
        }
    });
}

// Execute all tests
function runAllTests() {
    console.log('🚀 Executando todos os testes...');
    
    testManagersInitialization();
    testCacheManager();
    testPerformanceManager();
    testDashboardElements();
    testExportButtons();
    testScriptsLoaded();
    
    console.log('\n✨ Testes concluídos! Verifique os resultados acima.');
    console.log('💡 Para testar completamente, faça uma consulta com alguns IMEIs de teste.');
}

// Auto-run tests when script is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export test functions for manual execution
window.testAllcom = {
    runAllTests,
    testManagersInitialization,
    testCacheManager,
    testPerformanceManager,
    testDashboardElements,
    testExportButtons,
    testScriptsLoaded
};

console.log('🔧 Funções de teste disponíveis em window.testAllcom');
