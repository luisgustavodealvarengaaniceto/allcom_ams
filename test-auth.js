// Arquivo de teste para validar autenticação com a API JimiCloud
const crypto = require('crypto');
const fetch = require('node-fetch');

const API_CONFIG = {
    endpoint: 'http://fota-api.jimicloud.com',
    appKey: 'Jimiiotbrasil',
    secret: '23dd6cca658b4ec298aeb7beb4972fd4'
};

function generateMD5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

async function testAuthentication() {
    console.log('🔐 Testando autenticação com a API JimiCloud...\n');
    
    const testImeis = ['861359048155787']; // IMEI de teste
    const timestamp = Date.now();
    
    // Método 1: Headers customizados com MD5
    console.log('📋 Método 1: Headers customizados com MD5');
    try {
        const signString = `${API_CONFIG.appKey}${timestamp}${API_CONFIG.secret}`;
        const sign = generateMD5(signString);
        
        console.log(`   appkey: ${API_CONFIG.appKey}`);
        console.log(`   timestamp: ${timestamp}`);
        console.log(`   sign string: ${signString}`);
        console.log(`   sign MD5: ${sign}`);
        
        const response1 = await fetch(`${API_CONFIG.endpoint}/queryDeviceStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'appkey': API_CONFIG.appKey,
                'timestamp': timestamp.toString(),
                'sign': sign
            },
            body: JSON.stringify({ imeiList: testImeis }),
            timeout: 10000
        });
        
        console.log(`   Status: ${response1.status} ${response1.statusText}`);
        
        if (response1.ok) {
            const data1 = await response1.json();
            console.log(`   ✅ Sucesso! Dados: ${JSON.stringify(data1, null, 2)}`);
            return true;
        } else {
            const errorText = await response1.text();
            console.log(`   ❌ Erro: ${errorText}`);
        }
    } catch (error) {
        console.log(`   ❌ Exceção: ${error.message}`);
    }
    
    console.log('\n📋 Método 2: Authorization Basic');
    try {
        const authString = Buffer.from(`${API_CONFIG.appKey}:${API_CONFIG.secret}`).toString('base64');
        
        console.log(`   Auth string: ${authString}`);
        
        const response2 = await fetch(`${API_CONFIG.endpoint}/queryDeviceStatus`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Timestamp': timestamp.toString()
            },
            body: JSON.stringify({ imeiList: testImeis }),
            timeout: 10000
        });
        
        console.log(`   Status: ${response2.status} ${response2.statusText}`);
        
        if (response2.ok) {
            const data2 = await response2.json();
            console.log(`   ✅ Sucesso! Dados: ${JSON.stringify(data2, null, 2)}`);
            return true;
        } else {
            const errorText = await response2.text();
            console.log(`   ❌ Erro: ${errorText}`);
        }
    } catch (error) {
        console.log(`   ❌ Exceção: ${error.message}`);
    }
    
    console.log('\n📋 Método 3: Query Parameters');
    try {
        const signString = `${API_CONFIG.appKey}${timestamp}${API_CONFIG.secret}`;
        const sign = generateMD5(signString);
        
        const url = new URL(`${API_CONFIG.endpoint}/queryDeviceStatus`);
        url.searchParams.append('appkey', API_CONFIG.appKey);
        url.searchParams.append('timestamp', timestamp.toString());
        url.searchParams.append('sign', sign);
        
        console.log(`   URL: ${url.toString()}`);
        
        const response3 = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ imeiList: testImeis }),
            timeout: 10000
        });
        
        console.log(`   Status: ${response3.status} ${response3.statusText}`);
        
        if (response3.ok) {
            const data3 = await response3.json();
            console.log(`   ✅ Sucesso! Dados: ${JSON.stringify(data3, null, 2)}`);
            return true;
        } else {
            const errorText = await response3.text();
            console.log(`   ❌ Erro: ${errorText}`);
        }
    } catch (error) {
        console.log(`   ❌ Exceção: ${error.message}`);
    }
    
    console.log('\n❌ Todos os métodos de autenticação falharam');
    return false;
}

async function testProxyServer() {
    console.log('\n🔗 Testando servidor proxy local...\n');
    
    try {
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:3001/health');
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Proxy servidor está funcionando:', healthData.message);
        } else {
            console.log('❌ Proxy servidor retornou erro no health check');
            return false;
        }
        
        // Test actual API call through proxy
        const testImeis = ['861359048155787'];
        const proxyResponse = await fetch('http://localhost:3001/api/queryDeviceStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imeiList: testImeis })
        });
        
        console.log(`Proxy API Status: ${proxyResponse.status} ${proxyResponse.statusText}`);
        
        if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            console.log('✅ Sucesso via proxy! Dados:', JSON.stringify(proxyData, null, 2));
            return true;
        } else {
            const errorData = await proxyResponse.json().catch(() => ({}));
            console.log('❌ Erro via proxy:', errorData);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Erro ao testar proxy:', error.message);
        return false;
    }
}

// Executar testes
async function runTests() {
    console.log('🚀 Iniciando testes de autenticação...\n');
    
    const directAuth = await testAuthentication();
    const proxyAuth = await testProxyServer();
    
    console.log('\n📊 Resumo dos testes:');
    console.log(`   Autenticação direta: ${directAuth ? '✅ Sucesso' : '❌ Falhou'}`);
    console.log(`   Servidor proxy: ${proxyAuth ? '✅ Sucesso' : '❌ Falhou'}`);
    
    if (!directAuth && !proxyAuth) {
        console.log('\n❗ Ambos os métodos falharam. Verifique:');
        console.log('   1. Credenciais da API (appKey e secret)');
        console.log('   2. Formato da autenticação esperado pela API');
        console.log('   3. Se o servidor proxy está rodando (npm start)');
        console.log('   4. Se a API está funcionando corretamente');
    }
}

if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testAuthentication, testProxyServer, runTests };
