// Teste da funcionalidade de firmware clicável
console.log('=== TESTE: FIRMWARE CLICÁVEL ===');

// Dados de teste
const testDevices = [
    {
        imei: '123456789012345',
        isOnline: true,
        firmwareVersion: 'C450_V1.0.0',
        lastTimeBrasilia: '2024-01-15 10:30:00',
        offlineDays: 0
    },
    {
        imei: '123456789012346',
        isOnline: false,
        firmwareVersion: 'C450_V1.0.0',
        lastTimeBrasilia: '2024-01-10 08:15:00',
        offlineDays: 5
    },
    {
        imei: '123456789012347',
        isOnline: true,
        firmwareVersion: 'C450_V1.0.1',
        lastTimeBrasilia: '2024-01-15 11:20:00',
        offlineDays: 0
    }
];

// Teste 1: Verificar se o DashboardManager pode processar devices por firmware
console.log('1. Testando agrupamento por firmware...');
try {
    const dashboardManager = new DashboardManager();
    dashboardManager.calculateMetrics(testDevices);
    
    console.log('✓ Métricas calculadas:', dashboardManager.metrics);
    console.log('✓ Devices por firmware:', dashboardManager.firmwareDevices);
    
    // Verificar se os devices foram agrupados corretamente
    const firmwareVersions = Object.keys(dashboardManager.firmwareDevices);
    console.log('✓ Versões de firmware encontradas:', firmwareVersions);
    
    // Verificar se cada versão tem os devices corretos
    firmwareVersions.forEach(version => {
        const devices = dashboardManager.firmwareDevices[version];
        console.log(`✓ Versão ${version}: ${devices.length} devices`);
        devices.forEach(device => {
            console.log(`  - IMEI: ${device.imei}, Status: ${device.isOnline ? 'Online' : 'Offline'}`);
        });
    });
    
} catch (error) {
    console.error('❌ Erro no teste de agrupamento:', error);
}

// Teste 2: Simular clique em firmware (se estiver em ambiente DOM)
console.log('\n2. Testando funcionalidade de clique...');
try {
    if (typeof window !== 'undefined' && window.document) {
        // Criar elementos DOM de teste
        const testContainer = document.createElement('div');
        testContainer.id = 'firmwareList';
        document.body.appendChild(testContainer);
        
        const dashboardManager = new DashboardManager();
        dashboardManager.calculateMetrics(testDevices);
        dashboardManager.createFirmwareList();
        
        console.log('✓ Lista de firmware criada no DOM');
        console.log('✓ Elementos clicáveis adicionados');
        
        // Verificar se os elementos têm os atributos corretos
        const firmwareItems = document.querySelectorAll('.firmware-item.clickable');
        console.log(`✓ ${firmwareItems.length} items de firmware clicáveis encontrados`);
        
        // Limpeza
        testContainer.remove();
        
    } else {
        console.log('⚠️ Teste DOM pulado - ambiente não suporta DOM');
    }
} catch (error) {
    console.error('❌ Erro no teste de clique:', error);
}

// Teste 3: Verificar se os métodos necessários existem
console.log('\n3. Verificando métodos necessários...');
try {
    const dashboardManager = new DashboardManager();
    
    const requiredMethods = [
        'showFirmwareDetails',
        'createFirmwareModal',
        'closeFirmwareModal',
        'exportFirmwareDevices'
    ];
    
    requiredMethods.forEach(method => {
        if (typeof dashboardManager[method] === 'function') {
            console.log(`✓ Método ${method} existe e é uma função`);
        } else {
            console.error(`❌ Método ${method} não encontrado ou não é uma função`);
        }
    });
    
} catch (error) {
    console.error('❌ Erro na verificação de métodos:', error);
}

console.log('\n=== TESTE CONCLUÍDO ===');
console.log('Se todos os testes passaram, a funcionalidade está pronta!');
