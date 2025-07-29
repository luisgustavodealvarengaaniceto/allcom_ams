const fetch = require('node-fetch');

async function testProxy() {
    console.log('🔍 Testando proxy local...');
    
    const testImei = '869247060049894';
    
    try {
        const response = await fetch('http://localhost:3001/api/queryDeviceStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ imeiList: [testImei] })
        });

        console.log('📡 Status do proxy:', response.status);
        console.log('📋 Headers:', Object.fromEntries(response.headers));
        
        const responseText = await response.text();
        console.log('📄 Resposta do proxy:', responseText);
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('✅ Proxy funcionando!');
            console.log('📊 Dados:', data);
        } else {
            console.log('❌ Erro no proxy!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar proxy:', error.message);
    }
}

testProxy();
