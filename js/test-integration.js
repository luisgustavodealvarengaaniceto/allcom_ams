// Teste de Integração - Verificar funcionalidade do sistema após correções
// Execute este teste para verificar se o dashboard e exportação funcionam corretamente

console.log('=== TESTE DE INTEGRAÇÃO - SISTEMA ALLCOM JC450 ===');

// Teste 1: Verificar se todas as classes podem ser instanciadas
console.log('1. Testando instanciação de classes...');

try {
    // Verificar se o DashboardManager pode ser instanciado
    const dashboardManager = new DashboardManager();
    console.log('✓ DashboardManager instanciado com sucesso');
    
    // Verificar se o ExportManager pode ser instanciado
    const exportManager = new ExportManager();
    console.log('✓ ExportManager instanciado com sucesso');
    
    // Verificar se o AuthManager pode ser instanciado (se existir)
    if (typeof AuthManager !== 'undefined') {
        const authManager = new AuthManager();
        console.log('✓ AuthManager instanciado com sucesso');
    }
    
} catch (error) {
    console.error('❌ Erro na instanciação:', error.message);
}

// Teste 2: Verificar se não há referências a criticalBattery
console.log('\n2. Verificando remoção de referências a bateria crítica...');

// Dados de teste
const testDevices = [
    {
        imei: '123456789012345',
        isOnline: true,
        firmwareVersion: 'C450_V1.0.0',
        lastTimeBrasilia: '2024-01-15 10:30:00',
        offlineDays: 0,
        selfCheckParam: 'voltage:12.5V,csq:25,temp:45'
    },
    {
        imei: '123456789012346',
        isOnline: false,
        firmwareVersion: 'C450_V1.0.1',
        lastTimeBrasilia: '2024-01-10 08:15:00',
        offlineDays: 5,
        selfCheckParam: 'voltage:10.8V,csq:15,temp:52'
    }
];

try {
    const dashboardManager = new DashboardManager();
    dashboardManager.calculateMetrics(testDevices);
    
    // Verificar se não há propriedade criticalBattery
    if (dashboardManager.metrics.hasOwnProperty('criticalBattery')) {
        console.error('❌ Ainda existe propriedade criticalBattery nas métricas');
    } else {
        console.log('✓ Propriedade criticalBattery removida com sucesso');
    }
    
    console.log('✓ Métricas calculadas:', dashboardManager.metrics);
    
} catch (error) {
    console.error('❌ Erro no cálculo de métricas:', error.message);
}

// Teste 3: Verificar exportação
console.log('\n3. Testando funcionalidade de exportação...');

try {
    const exportManager = new ExportManager();
    
    // Testar exportação CSV
    const csvData = exportManager.exportToCSV(testDevices, 'teste');
    console.log('✓ Exportação CSV funciona corretamente');
    
    // Testar exportação Excel (se disponível)
    if (typeof exportManager.exportToExcel === 'function') {
        console.log('✓ Método exportToExcel disponível');
    }
    
    // Testar exportação JSON
    if (typeof exportManager.exportToJSON === 'function') {
        const jsonData = exportManager.exportToJSON(testDevices);
        console.log('✓ Exportação JSON funciona corretamente');
    }
    
} catch (error) {
    console.error('❌ Erro na exportação:', error.message);
}

console.log('\n=== TESTE CONCLUÍDO ===');
console.log('Se todos os testes passaram, o sistema está pronto para produção!');
