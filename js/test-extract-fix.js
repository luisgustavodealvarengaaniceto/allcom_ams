// Teste para verificar se o erro de extractSDCardInfo foi corrigido
function testExtractSDCardInfo() {
    console.log('🧪 Testando extractSDCardInfo...');
    
    // Testes com diferentes formatos de log
    const testCases = [
        {
            name: 'Log normal com SD1 e SD2',
            log: 'SD1:233 GB/2.18 GB,SD2:233 GB/2.06 GB,MEMORY:2.75 GB/561 MB',
            expected: true
        },
        {
            name: 'Log com SD1 sem barra',
            log: 'SD1:233 GB,SD2:233 GB/2.06 GB',
            expected: true
        },
        {
            name: 'Log vazio',
            log: '',
            expected: false
        },
        {
            name: 'Log undefined',
            log: undefined,
            expected: false
        },
        {
            name: 'Log null',
            log: null,
            expected: false
        },
        {
            name: 'Log sem informações de SD',
            log: 'NETWORK:4G,GPS:Ativo',
            expected: false
        }
    ];
    
    testCases.forEach(testCase => {
        try {
            console.log(`📋 Testando: ${testCase.name}`);
            const result = extractSDCardInfo ? extractSDCardInfo(testCase.log) : null;
            
            if (testCase.expected && result) {
                console.log(`✅ ${testCase.name}: OK - Resultado obtido`);
            } else if (!testCase.expected && (!result || Object.keys(result).length === 0)) {
                console.log(`✅ ${testCase.name}: OK - Resultado vazio como esperado`);
            } else {
                console.log(`⚠️ ${testCase.name}: Resultado inesperado`, result);
            }
            
        } catch (error) {
            console.error(`❌ ${testCase.name}: Erro -`, error.message);
        }
    });
    
    console.log('🏁 Teste de extractSDCardInfo concluído');
}

// Teste da função processResults com dados simulados
function testProcessResults() {
    console.log('🧪 Testando processResults com dados problemáticos...');
    
    // Simular dados que podem causar erro
    const originalDeviceResults = window.deviceResults || [];
    
    window.deviceResults = [
        {
            imei: '123456789012345',
            lastTime: new Date().toISOString(),
            log: 'SD1:233 GB,SD2:incomplete', // Formato problemático
            selfCheckParam: 'key1:value1;key2' // Formato problemático
        },
        {
            imei: '123456789012346',
            lastTime: new Date().toISOString(),
            log: null, // Log null
            selfCheckParam: undefined // selfCheckParam undefined
        }
    ];
    
    try {
        if (typeof processResults === 'function') {
            processResults();
            console.log('✅ processResults executado sem erros com dados problemáticos');
        } else {
            console.log('⚠️ Função processResults não encontrada');
        }
    } catch (error) {
        console.error('❌ Erro em processResults:', error);
    } finally {
        // Restaurar dados originais
        window.deviceResults = originalDeviceResults;
    }
}

// Executar testes
if (typeof extractSDCardInfo === 'function') {
    testExtractSDCardInfo();
} else {
    console.log('⚠️ Função extractSDCardInfo não disponível ainda');
}

// Disponibilizar no console
window.testExtractSDCardInfo = testExtractSDCardInfo;
window.testProcessResults = testProcessResults;
