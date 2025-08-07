const fetch = require('node-fetch');

async function testWithValidToken() {
    console.log('🔑 Testando consulta com token válido...');
    
    // Step 1: Get token
    const credentials = {
        appKey: 'Jimiiotbrasil',
        secret: '23dd6cca658b4ec298aeb7beb4972fd4'
    };
    
    try {
        console.log('📡 1. Obtendo token...');
        
        const tokenResponse = await fetch('http://fota-api.jimicloud.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials),
            timeout: 10000
        });
        
        if (!tokenResponse.ok) {
            throw new Error(`Token request failed: ${tokenResponse.status}`);
        }
        
        const tokenData = await tokenResponse.json();
        const token = tokenData.data.token;
        console.log('✅ Token obtido:', token.substring(0, 50) + '...');
        
        // Step 2: Test queryDeviceStatus with token
        const testIMEIs = ['860922050034095', '860922050034087'];
        
        console.log('📡 2. Testando queryDeviceStatus com token...');
        
        // Test different authorization headers
        const authMethods = [
            { name: 'Authorization (token apenas)', headers: { 'Authorization': token } },
            { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${token}` } },
            { name: 'Header token', headers: { 'token': token } },
            { name: 'Header access_token', headers: { 'access_token': token } },
            { name: 'Header x-access-token', headers: { 'x-access-token': token } }
        ];
        
        for (const method of authMethods) {
            console.log(`\n🧪 Testando: ${method.name}`);
            
            try {
                const response = await fetch('http://fota-api.jimicloud.com/queryDeviceStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...method.headers
                    },
                    body: JSON.stringify({ imeiList: testIMEIs }),
                    timeout: 15000
                });
                
                console.log(`📊 Status: ${response.status} ${response.statusText}`);
                
                const responseText = await response.text();
                console.log(`📄 Resposta: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
                
                if (response.ok) {
                    console.log('🎉 SUCESSO! Método de autorização funcionou:', method.name);
                    try {
                        const data = JSON.parse(responseText);
                        if (Array.isArray(data) || (data.data && Array.isArray(data.data))) {
                            console.log('✅ Resposta contém array de dispositivos!');
                            return method.name;
                        }
                    } catch (e) {
                        console.log('⚠️ Resposta não é JSON válido');
                    }
                } else if (response.status === 401) {
                    console.log('❌ 401 Unauthorized - método não funcionou');
                } else {
                    console.log(`⚠️ Status ${response.status} - pode precisar investigar`);
                }
                
            } catch (error) {
                console.error(`💥 Erro no método ${method.name}:`, error.message);
            }
        }
        
        console.log('\n❌ Nenhum método de autorização funcionou');
        return null;
        
    } catch (error) {
        console.error('💥 Erro geral:', error.message);
        return null;
    }
}

testWithValidToken().catch(console.error);
