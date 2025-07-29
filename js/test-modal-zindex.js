// Teste para verificar correção do z-index dos modais
console.log('=== TESTE: CORREÇÃO Z-INDEX DOS MODAIS ===');

// Simular cenário onde modal de firmware está aberto
console.log('1. Simulando modal de firmware aberto...');

// Criar elementos de teste
const testFirmwareModal = document.createElement('div');
testFirmwareModal.id = 'firmwareModal';
testFirmwareModal.classList.add('firmware-modal-overlay', 'show');
document.body.appendChild(testFirmwareModal);

const testDeviceModal = document.createElement('div');
testDeviceModal.id = 'deviceModal';
testDeviceModal.classList.add('modal', 'hidden');
document.body.appendChild(testDeviceModal);

console.log('2. Elementos de teste criados');

// Testar função showDeviceDetails
try {
    // Simular dados de teste
    window.deviceResults = [{
        imei: '123456789012345',
        isOnline: true,
        firmwareVersion: 'C450_V1.0.0',
        lastTimeBrasilia: '2024-01-15 10:30:00',
        offlineDays: 0
    }];
    
    window.modalTitle = { textContent: '' };
    window.modalBody = { innerHTML: '' };
    window.deviceModal = testDeviceModal;
    
    console.log('3. Dados de teste configurados');
    
    // Testar showDeviceDetails
    if (typeof showDeviceDetails === 'function') {
        showDeviceDetails('123456789012345');
        
        // Verificar se z-index foi ajustado
        const zIndex = testDeviceModal.style.zIndex;
        const hasOverlayClass = testDeviceModal.classList.contains('overlay-modal');
        
        console.log('4. Testando com modal firmware aberto:');
        console.log(`   - Z-index: ${zIndex}`);
        console.log(`   - Classe overlay-modal: ${hasOverlayClass}`);
        
        if (zIndex === '2100' && hasOverlayClass) {
            console.log('✓ Modal de dispositivo configurado corretamente para sobrepor firmware');
        } else {
            console.log('❌ Modal de dispositivo não configurado corretamente');
        }
        
        // Testar hideModal
        if (typeof hideModal === 'function') {
            hideModal();
            
            const zIndexAfterClose = testDeviceModal.style.zIndex;
            const hasOverlayClassAfterClose = testDeviceModal.classList.contains('overlay-modal');
            
            console.log('5. Testando após fechar modal:');
            console.log(`   - Z-index: ${zIndexAfterClose}`);
            console.log(`   - Classe overlay-modal: ${hasOverlayClassAfterClose}`);
            
            if (zIndexAfterClose === '1000' && !hasOverlayClassAfterClose) {
                console.log('✓ Modal resetado corretamente após fechar');
            } else {
                console.log('❌ Modal não resetado corretamente após fechar');
            }
        }
        
    } else {
        console.log('❌ Função showDeviceDetails não encontrada');
    }
    
} catch (error) {
    console.error('❌ Erro no teste:', error);
}

// Testar sem modal firmware
console.log('\n6. Testando sem modal firmware aberto...');
testFirmwareModal.classList.remove('show');

try {
    if (typeof showDeviceDetails === 'function') {
        showDeviceDetails('123456789012345');
        
        const zIndex = testDeviceModal.style.zIndex;
        const hasOverlayClass = testDeviceModal.classList.contains('overlay-modal');
        
        console.log(`   - Z-index: ${zIndex}`);
        console.log(`   - Classe overlay-modal: ${hasOverlayClass}`);
        
        if (zIndex === '1000' && !hasOverlayClass) {
            console.log('✓ Modal de dispositivo configurado corretamente para modo normal');
        } else {
            console.log('❌ Modal de dispositivo não configurado corretamente para modo normal');
        }
    }
} catch (error) {
    console.error('❌ Erro no teste sem firmware modal:', error);
}

// Limpeza
console.log('\n7. Limpando elementos de teste...');
testFirmwareModal.remove();
testDeviceModal.remove();

console.log('\n=== TESTE CONCLUÍDO ===');
console.log('Se os testes passaram, o modal de dispositivo agora aparece corretamente sobre o modal de firmware!');
