// Teste rápido do sistema Allcom JC450 após correções
console.log('🧪 === TESTE DO SISTEMA ALLCOM JC450 ===');

// Verificar se todas as classes estão disponíveis
function testClassesAvailable() {
    console.log('\n📋 Verificando classes disponíveis:');
    
    const classes = [
        'CacheManager',
        'PerformanceManager', 
        'DashboardManager',
        'ExportManager',
        'FirmwareManager'
    ];
    
    classes.forEach(className => {
        if (typeof window[className] !== 'undefined') {
            console.log(`✅ ${className}: Disponível`);
        } else {
            console.log(`❌ ${className}: Não encontrada`);
        }
    });
}

// Verificar se os managers foram inicializados
function testManagersInitialized() {
    console.log('\n🔧 Verificando inicialização dos managers:');
    
    const managers = [
        'cacheManager',
        'performanceManager',
        'dashboardManager', 
        'exportManager',
        'firmwareManager'
    ];
    
    managers.forEach(managerName => {
        if (typeof window[managerName] !== 'undefined' && window[managerName]) {
            console.log(`✅ ${managerName}: Inicializado`);
        } else {
            console.log(`❌ ${managerName}: Não inicializado`);
        }
    });
}

// Testar funcionalidade de firmware
function testFirmwareFeatures() {
    console.log('\n🔧 Testando funcionalidades de firmware:');
    
    try {
        if (window.firmwareManager) {
            // Testar parsing de firmware
            const testVersion = 'C450Pro_2.0.16_20250526';
            const parsed = firmwareManager.parseFirmwareVersion(testVersion);
            
            if (parsed) {
                console.log(`✅ Parse de firmware funcionando: ${testVersion}`);
                console.log(`   Major: ${parsed.major}, Minor: ${parsed.minor}, Patch: ${parsed.patch}`);
            } else {
                console.log(`❌ Parse de firmware falhou para: ${testVersion}`);
            }
            
            // Testar lista de firmwares
            const allFirmwares = firmwareManager.getAllFirmwares();
            console.log(`✅ Lista de firmwares: ${allFirmwares.length} versões disponíveis`);
            
        } else {
            console.log('❌ FirmwareManager não disponível');
        }
    } catch (error) {
        console.log('❌ Erro ao testar firmware:', error.message);
    }
}

// Testar seleção específica de firmware
function testFirmwareSelection() {
    console.log('\n🔧 Testando seleção específica de firmware:');
    
    try {
        if (!window.firmwareManager) {
            console.log('❌ FirmwareManager não disponível');
            return;
        }

        // Testar firmware predefinidos
        const predefinedFirmwares = [
            'C450Pro_2.0.16_20250526',
            'C450Pro_2.0.13_20250410', 
            'C450Pro_2.0.08_20241028'
        ];

        predefinedFirmwares.forEach((firmware, index) => {
            console.log(`\n🧪 Testando firmware ${index + 1}: ${firmware}`);
            
            try {
                // Step 1: Parse
                const parsed = firmwareManager.parseFirmwareVersion(firmware);
                if (parsed) {
                    console.log(`  ✅ Parse OK: v${parsed.major}.${parsed.minor}.${parsed.patch}`);
                } else {
                    console.log(`  ❌ Parse falhou`);
                    return;
                }

                // Step 2: Set as reference
                firmwareManager.setReferenceFirmware(firmware);
                console.log(`  ✅ Definido como referência`);

                // Step 3: Get reference
                const reference = firmwareManager.getReferenceFirmware();
                if (reference === firmware) {
                    console.log(`  ✅ Referência salva corretamente`);
                } else {
                    console.log(`  ❌ Referência não salva (esperado: ${firmware}, atual: ${reference})`);
                }

            } catch (error) {
                console.log(`  ❌ Erro: ${error.message}`);
            }
        });

        // Testar se o elemento DOM existe
        const firmwareSelect = document.getElementById('firmwareSelect');
        if (firmwareSelect) {
            console.log('\n✅ Elemento firmwareSelect encontrado');
            console.log(`   Valor atual: "${firmwareSelect.value}"`);
            console.log(`   Opções disponíveis: ${firmwareSelect.options.length}`);
            
            // Listar todas as opções
            for (let i = 0; i < firmwareSelect.options.length; i++) {
                const option = firmwareSelect.options[i];
                console.log(`     ${i}: "${option.value}" - "${option.text}"`);
            }
        } else {
            console.log('\n❌ Elemento firmwareSelect não encontrado');
        }

    } catch (error) {
        console.log(`❌ Erro geral no teste: ${error.message}`);
        console.log(error.stack);
    }
}

// Testar elementos da interface
function testUIElements() {
    console.log('\n🖥️ Verificando elementos da interface:');
    
    const elements = [
        'firmwareSelect',
        'customFirmwareInput',
        'newFirmwareVersion',
        'addFirmwareBtn',
        'cancelFirmwareBtn',
        'currentFirmwareDisplay',
        'dashboardSection',
        'exportCsv',
        'exportExcel',
        'exportJson'
    ];
    
    elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ ${elementId}: Encontrado`);
        } else {
            console.log(`❌ ${elementId}: Não encontrado`);
        }
    });
}

// Função para testar firmware manualmente no console
function testFirmwareManual() {
    console.log('🔧 === TESTE MANUAL DE FIRMWARE ===');
    
    // Verificar se firmwareManager existe
    if (!window.firmwareManager) {
        console.log('❌ firmwareManager não encontrado');
        return;
    }
    
    // Testar each firmware individualmente
    const testFirmwares = [
        'C450Pro_2.0.16_20250526',
        'C450Pro_2.0.13_20250410', 
        'C450Pro_2.0.08_20241028'
    ];
    
    testFirmwares.forEach(fw => {
        console.log(`\n🧪 Testando: ${fw}`);
        
        try {
            // Test parsing
            const parsed = window.firmwareManager.parseFirmwareVersion(fw);
            console.log('  📋 Parsed:', parsed);
            
            if (parsed) {
                // Test setting as reference
                window.firmwareManager.setReferenceFirmware(fw);
                console.log('  ✅ Set como referência');
                
                // Test getting reference
                const ref = window.firmwareManager.getReferenceFirmware();
                console.log('  📌 Referência atual:', ref);
            }
        } catch (error) {
            console.log('  ❌ Erro:', error.message);
        }
    });
    
    // Test dropdown
    const select = document.getElementById('firmwareSelect');
    if (select) {
        console.log('\n📋 Dropdown firmwareSelect:');
        console.log('  Options:', select.options.length);
        for (let i = 0; i < select.options.length; i++) {
            console.log(`    ${i}: "${select.options[i].value}"`);
        }
    }
}

// Executar todos os testes
function runAllTests() {
    console.log('🚀 Iniciando bateria de testes...\n');
    
    testClassesAvailable();
    
    // Aguardar um pouco para os managers serem inicializados
    setTimeout(() => {
        testManagersInitialized();
        testFirmwareFeatures();
        testFirmwareSelection();
        testUIElements();
        
        console.log('\n✨ Testes concluídos!');
        console.log('💡 Se todos os testes passaram, o sistema está funcionando corretamente.');
    }, 1000);
}

// Executar testes quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Disponibilizar função globalmente
window.testSystem = runAllTests;
window.testFirmwareManual = testFirmwareManual;
