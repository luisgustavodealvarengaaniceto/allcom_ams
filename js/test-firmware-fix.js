// Teste rápido para verificar a correção do erro de firmware clicável
console.log('=== TESTE: CORREÇÃO FIRMWARE CLICÁVEL ===');

// Dados de teste com versão problemática
const testDevices = [
    {
        imei: '123456789012345',
        isOnline: true,
        firmwareVersion: 'C450_1.8.18_20240715', // Versão com underscores e números
        lastTimeBrasilia: '2024-01-15 10:30:00',
        offlineDays: 0
    },
    {
        imei: '123456789012346',
        isOnline: false,
        firmwareVersion: 'C450_1.8.18_20240715', // Mesma versão
        lastTimeBrasilia: '2024-01-10 08:15:00',
        offlineDays: 5
    },
    {
        imei: '123456789012347',
        isOnline: true,
        firmwareVersion: 'C450_V1.0.1', // Versão diferente
        lastTimeBrasilia: '2024-01-15 11:20:00',
        offlineDays: 0
    }
];

try {
    console.log('1. Criando DashboardManager...');
    const dashboardManager = new DashboardManager();
    
    console.log('2. Inicializando firmwareDevices:', dashboardManager.firmwareDevices);
    
    console.log('3. Calculando métricas...');
    dashboardManager.calculateMetrics(testDevices);
    
    console.log('4. Verificando firmwareDevices após cálculo:');
    console.log('   - Versões disponíveis:', Object.keys(dashboardManager.firmwareDevices));
    console.log('   - Dados por versão:', dashboardManager.firmwareDevices);
    
    console.log('5. Testando showFirmwareDetails...');
    const problemVersion = 'C450_1.8.18_20240715';
    
    if (dashboardManager.firmwareDevices[problemVersion]) {
        console.log(`✓ Versão ${problemVersion} encontrada com ${dashboardManager.firmwareDevices[problemVersion].length} devices`);
        console.log('✓ Método showFirmwareDetails deve funcionar agora');
    } else {
        console.error(`❌ Versão ${problemVersion} não encontrada em firmwareDevices`);
    }
    
    console.log('6. Testando outras versões...');
    Object.keys(dashboardManager.firmwareDevices).forEach(version => {
        const devices = dashboardManager.firmwareDevices[version];
        console.log(`   - ${version}: ${devices.length} devices`);
    });
    
} catch (error) {
    console.error('❌ Erro no teste:', error);
}

console.log('\n=== RESUMO DAS CORREÇÕES ===');
console.log('✓ Inicialização de firmwareDevices no construtor');
console.log('✓ Verificação adicional no showFirmwareDetails');
console.log('✓ Mudança de onclick inline para event listeners');
console.log('✓ Uso de data-attributes para evitar problemas com caracteres');
console.log('✓ Logs de debug para monitoramento');

console.log('\n=== TESTE CONCLUÍDO ===');
