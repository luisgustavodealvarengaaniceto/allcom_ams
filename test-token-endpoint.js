const fetch = require('node-fetch');

async function testTokenEndpoint() {
    console.log('🔑 Testando endpoint de token da JimiCloud...');
    
    const credentials = {
        appKey: 'Jimiiotbrasil',
        secret: '23dd6cca658b4ec298aeb7beb4972fd4'
    };
    
    try {
        console.log('📡 Fazendo requisição para /token...');
        console.log('🔐 Credenciais:', credentials);
        
        const response = await fetch('http://fota-api.jimicloud.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials),
            timeout: 10000
        });
        
        console.log('📊 Status da resposta:', response.status, response.statusText);
        console.log('📋 Headers da resposta:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        const responseText = await response.text();
        console.log('📄 Corpo da resposta (texto):', responseText);
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ Resposta JSON válida:', JSON.stringify(data, null, 2));
                
                if (data.code === 0 && data.data && data.data.token) {
                    console.log('🎉 TOKEN OBTIDO COM SUCESSO:', data.data.token);
                    return data.data.token;
                } else {
                    console.log('❌ Resposta não contém token válido');
                    return null;
                }
            } catch (e) {
                console.log('⚠️ Resposta não é JSON válido');
                return null;
            }
        } else {
            console.log('❌ Erro na requisição:', response.status);
            return null;
        }
        
    } catch (error) {
        console.error('💥 Erro ao testar token:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

// Test both HTTP and HTTPS
async function testBothProtocols() {
    console.log('=== TESTE HTTP ===');
    await testTokenEndpoint();
    
    console.log('\n=== TESTE HTTPS ===');
    // Test HTTPS version
    const credentials = {
        appKey: 'Jimiiotbrasil',
        secret: '23dd6cca658b4ec298aeb7beb4972fd4'
    };
    
    try {
        const response = await fetch('https://fota-api.jimicloud.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials),
            timeout: 10000
        });
        
        console.log('📊 HTTPS Status:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('📄 HTTPS Resposta:', responseText);
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('✅ HTTPS Token obtido:', data.data?.token);
        }
        
    } catch (error) {
        console.error('💥 HTTPS Error:', error.message);
    }
}

testBothProtocols().catch(console.error);
