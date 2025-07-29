// Debug script para investigar IMEIs específicos usando o proxy local
const fetch = require('node-fetch');

// IMEIs para teste - incluindo o problemático e alguns que funcionam
const TEST_IMEIS = [
    '869247060280671', // IMEI problemático
    '869247060283451', // IMEI que funcionou no teste anterior
    '860112070149093', // IMEI que funcionou no teste anterior
    '869247060287429', // Outro IMEI que falhou
    '869247060311583', // Outro IMEI que falhou
];

const PROXY_URL = 'http://localhost:3001/api/queryDeviceStatus';

// Test single IMEI via proxy
async function testSingleIMEIViaProxy(imei) {
    console.log(`\n🔍 Testando IMEI via proxy: ${imei}`);
    
    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AllcomJC450-Debug/1.0'
            },
            body: JSON.stringify({
                imeiList: [imei]
            })
        });
        
        console.log(`   Status: ${response.status}`);
        
        const responseText = await response.text();
        console.log(`   Raw Response: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.log(`   💥 ERRO no parse JSON: ${parseError.message}`);
            return null;
        }
        
        console.log(`   Response Code: ${result.code}`);
        console.log(`   Response Message: ${result.msg}`);
        console.log(`   Data Length: ${result.data ? result.data.length : 'N/A'}`);
        
        if (result.data && result.data.length > 0) {
            console.log(`   ✅ SUCESSO - Dados encontrados`);
            console.log(`   Device Info:`, {
                imei: result.data[0].imei,
                version: result.data[0].version,
                lastTime: result.data[0].lastTime,
                iccid: result.data[0].iccid?.substring(0, 10) + '...'
            });
        } else {
            console.log(`   ❌ FALHA - Nenhum dado retornado`);
            
            // Verificar se o IMEI está bem formatado
            if (imei.length !== 15) {
                console.log(`   ⚠️ IMEI tem comprimento incorreto: ${imei.length} (esperado: 15)`);
            }
            
            if (!/^\d+$/.test(imei)) {
                console.log(`   ⚠️ IMEI contém caracteres não numéricos`);
            }
            
            // Verificar se é um erro conhecido da API
            if (result.code === 0 && (!result.data || result.data.length === 0)) {
                console.log(`   📋 ANÁLISE: API retornou sucesso mas sem dados - IMEI pode não estar cadastrado na JimiCloud`);
            }
        }
        
        return result;
        
    } catch (error) {
        console.log(`   💥 ERRO: ${error.message}`);
        return null;
    }
}

// Check IMEI validity using Luhn algorithm
function validateIMEI(imei) {
    if (!/^\d{15}$/.test(imei)) {
        return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 14; i++) {
        let digit = parseInt(imei[i]);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
                digit = Math.floor(digit / 10) + (digit % 10);
            }
        }
        sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(imei[14]);
}

// Analyze IMEI patterns
function analyzeIMEI(imei) {
    console.log(`   📊 ANÁLISE DO IMEI:`);
    console.log(`      Comprimento: ${imei.length}`);
    console.log(`      Só números: ${/^\d+$/.test(imei)}`);
    console.log(`      Luhn válido: ${validateIMEI(imei)}`);
    console.log(`      TAC (primeiros 8 dígitos): ${imei.substring(0, 8)}`);
    console.log(`      SNR (próximos 6 dígitos): ${imei.substring(8, 14)}`);
    console.log(`      Check digit: ${imei.substring(14, 15)}`);
    
    // Identificar possível fabricante pelo TAC
    const tac = imei.substring(0, 8);
    if (tac.startsWith('86924706')) {
        console.log(`      🏭 Possível fabricante: JimiIoT (padrão conhecido)`);
    } else if (tac.startsWith('86011207')) {
        console.log(`      🏭 Possível fabricante: Outro fabricante`);
    } else {
        console.log(`      🏭 Fabricante: Desconhecido`);
    }
}

// Test proxy connection first
async function testProxyConnection() {
    console.log('🔗 Testando conexão com o proxy local...');
    
    try {
        const response = await fetch('http://localhost:3001/health', {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            console.log('✅ Proxy local está rodando e acessível');
            return true;
        } else {
            console.log(`❌ Proxy retornou status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Erro ao conectar com proxy: ${error.message}`);
        console.log('💡 Certifique-se de que o proxy está rodando: npm start ou node proxy-server.js');
        return false;
    }
}

// Main test function
async function runDebugTests() {
    console.log('🚀 Iniciando debug de IMEIs específicos via proxy...\n');
    
    try {
        // Test proxy connection first
        const proxyOk = await testProxyConnection();
        if (!proxyOk) {
            return;
        }
        
        // Test each IMEI
        const results = [];
        
        for (const imei of TEST_IMEIS) {
            console.log('\n' + '='.repeat(60));
            
            // Validate and analyze IMEI
            const isValid = validateIMEI(imei);
            console.log(`📱 IMEI: ${imei} (${isValid ? 'VÁLIDO' : 'INVÁLIDO'})`);
            
            analyzeIMEI(imei);
            
            if (!isValid) {
                console.log('⚠️ IMEI falha na validação Luhn - pode ser o problema!');
            }
            
            // Test the IMEI
            const result = await testSingleIMEIViaProxy(imei);
            results.push({
                imei,
                valid: isValid,
                success: result && result.data && result.data.length > 0,
                result
            });
            
            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🏁 Debug concluído!');
        
        // Summary
        console.log('\n📊 RESUMO:');
        console.log(`- IMEIs testados: ${TEST_IMEIS.length}`);
        
        const validIMEIs = results.filter(r => r.valid);
        const successfulIMEIs = results.filter(r => r.success);
        const validButFailed = results.filter(r => r.valid && !r.success);
        
        console.log(`- IMEIs válidos (Luhn): ${validIMEIs.length}`);
        console.log(`- IMEIs com sucesso na API: ${successfulIMEIs.length}`);
        console.log(`- IMEIs válidos mas falharam na API: ${validButFailed.length}`);
        
        if (validButFailed.length > 0) {
            console.log('\n❌ IMEIs válidos que falharam na API:');
            validButFailed.forEach(r => {
                console.log(`   - ${r.imei} (${r.result?.msg || 'sem dados'})`);
            });
            console.log('\n💡 CONCLUSÃO: Estes IMEIs são válidos mas não estão cadastrados na base da JimiCloud');
        }
        
        if (successfulIMEIs.length > 0) {
            console.log('\n✅ IMEIs que funcionaram:');
            successfulIMEIs.forEach(r => {
                console.log(`   - ${r.imei}`);
            });
        }
        
    } catch (error) {
        console.error('💥 Erro durante o debug:', error);
    }
}

// Run the debug
runDebugTests().catch(console.error);
