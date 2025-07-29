// Debug script para investigar IMEIs específicos que estão falhando
const API_CONFIG = {
    baseUrl: 'http://fota-api.jimicloud.com',
    appKey: 'Jimiiotbrasil',
    secret: 'f70ab3bb5ab2f7a99d2e2b67449b70ae',
    timeout: 30000
};

// IMEIs para teste - incluindo o problemático e alguns que funcionam
const TEST_IMEIS = [
    '869247060280671', // IMEI problemático
    '869247060283451', // IMEI que funcionou no teste anterior
    '860112070149093', // IMEI que funcionou no teste anterior
    '869247060287429', // Outro IMEI que falhou
    '869247060311583', // Outro IMEI que falhou
];

// Generate MD5 hash
function generateMD5(str) {
    return require('crypto').createHash('md5').update(str).digest('hex');
}

// Get auth token
async function getAuthToken() {
    const timestamp = Date.now();
    const signString = `${API_CONFIG.appKey}${timestamp}${API_CONFIG.secret}`;
    const sign = generateMD5(signString);
    
    console.log('Debug token request:', {
        appkey: API_CONFIG.appKey,
        timestamp: timestamp.toString(),
        sign: sign
    });
    
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/getToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AllcomJC450/1.0'
            },
            body: JSON.stringify({
                appkey: API_CONFIG.appKey,
                timestamp: timestamp.toString(),
                sign: sign
            })
        });
        
        console.log('Token response status:', response.status);
        console.log('Token response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Token response raw text:', responseText);
        
        if (!responseText) {
            throw new Error('Resposta vazia do servidor');
        }
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`Erro ao fazer parse do JSON: ${parseError.message}. Resposta: ${responseText}`);
        }
        
        if (result.code === 0 && result.data && result.data.token) {
            return result.data.token;
        } else {
            throw new Error(`Erro ao obter token: ${result.msg || 'Resposta inválida'}. Resposta completa: ${JSON.stringify(result)}`);
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Erro de conexão - verifique se a API está acessível');
        }
        throw error;
    }
}

// Test single IMEI
async function testSingleIMEI(imei, token) {
    console.log(`\n🔍 Testando IMEI: ${imei}`);
    
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/queryDeviceStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'AllcomJC450/1.0'
            },
            body: JSON.stringify({
                imeiList: [imei]
            })
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
        
        const responseText = await response.text();
        console.log(`   Raw Response: ${responseText}`);
        
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
                iccid: result.data[0].iccid
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
        }
        
        return result;
        
    } catch (error) {
        console.log(`   💥 ERRO: ${error.message}`);
        return null;
    }
}

// Test IMEI variations
async function testIMEIVariations(baseImei, token) {
    console.log(`\n🧪 Testando variações do IMEI: ${baseImei}`);
    
    // Teste diferentes formatações do mesmo IMEI
    const variations = [
        baseImei,                           // Original
        baseImei.replace(/\s/g, ''),       // Sem espaços
        baseImei.trim(),                   // Sem espaços no início/fim
        '0' + baseImei,                    // Com zero à frente
        baseImei.substring(0, 14),         // Sem último dígito
        baseImei + '0'                     // Com zero extra
    ];
    
    for (const variation of variations) {
        if (variation !== baseImei) {
            console.log(`\n   Testando variação: "${variation}"`);
            await testSingleIMEI(variation, token);
        }
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

// Main test function
async function runDebugTests() {
    console.log('🚀 Iniciando debug de IMEIs específicos...\n');
    
    try {
        // Get authentication token
        console.log('🔑 Obtendo token de autenticação...');
        const token = await getAuthToken();
        console.log('✅ Token obtido com sucesso');
        
        // Test each IMEI
        for (const imei of TEST_IMEIS) {
            console.log('\n' + '='.repeat(60));
            
            // Validate IMEI
            const isValid = validateIMEI(imei);
            console.log(`📱 IMEI: ${imei} (${isValid ? 'VÁLIDO' : 'INVÁLIDO'})`);
            
            if (!isValid) {
                console.log('⚠️ IMEI falha na validação Luhn - pode ser o problema!');
            }
            
            // Test the IMEI
            await testSingleIMEI(imei, token);
            
            // Test variations if it failed
            const result = await testSingleIMEI(imei, token);
            if (!result || !result.data || result.data.length === 0) {
                await testIMEIVariations(imei, token);
            }
            
            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🏁 Debug concluído!');
        
        // Summary
        console.log('\n📊 RESUMO:');
        console.log('- IMEIs testados:', TEST_IMEIS.length);
        console.log('- Verificar logs acima para padrões de falha');
        console.log('- IMEIs inválidos podem estar causando o problema');
        
    } catch (error) {
        console.error('💥 Erro durante o debug:', error);
    }
}

// Run the debug
runDebugTests().catch(console.error);
