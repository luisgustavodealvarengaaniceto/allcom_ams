// Teste para verificar se showDeviceDetails funciona após correção
function testShowDeviceDetails() {
    console.log('🧪 Testando showDeviceDetails...');
    
    // Simular um dispositivo de exemplo
    const mockDevice = {
        imei: '123456789012345',
        firmwareVersion: 'C450Pro_2.0.16_20250526',
        isOnline: true,
        lastTime: new Date().toISOString(),
        daysOffline: 0
    };
    
    // Adicionar ao array global para teste
    if (typeof deviceResults !== 'undefined') {
        deviceResults.push(mockDevice);
        console.log('✅ Mock device adicionado');
    } else {
        console.log('⚠️ deviceResults não disponível');
    }
    
    // Testar a função
    try {
        if (typeof showDeviceDetails === 'function') {
            console.log('✅ Função showDeviceDetails encontrada');
            showDeviceDetails('123456789012345');
            console.log('✅ showDeviceDetails executada sem erros');
        } else {
            console.log('❌ Função showDeviceDetails não encontrada');
        }
    } catch (error) {
        console.error('❌ Erro ao executar showDeviceDetails:', error);
    }
}

// Executar teste após carregamento
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testShowDeviceDetails, 2000);
});

// Disponibilizar teste no console
window.testShowDeviceDetails = testShowDeviceDetails;
