// Teste RAW direto na API JimiCloud sem tratamento algum
const fetch = require('node-fetch');

const IMEI_TESTE = '869247060280671';
const PROXY_URL = 'http://localhost:3001/api/queryDeviceStatus';

async function testeRawAPI() {
    console.log('🧪 TESTE RAW - API JimiCloud');
    console.log('============================');
    console.log(`IMEI: ${IMEI_TESTE}`);
    console.log('Fazendo requisição sem tratamento algum...\n');
    
    try {
        const requestBody = { imeiList: [IMEI_TESTE] };
        console.log('📤 REQUEST BODY:');
        console.log(JSON.stringify(requestBody, null, 2));
        console.log('\n⏳ Enviando requisição...\n');
        
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'RAW-Test/1.0'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 RESPONSE STATUS:', response.status);
        console.log('📥 RESPONSE STATUS TEXT:', response.statusText);
        console.log('📥 RESPONSE HEADERS:');
        console.log(JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        
        const responseText = await response.text();
        console.log('\n📥 RESPONSE RAW TEXT:');
        console.log('---START---');
        console.log(responseText);
        console.log('---END---');
        
        console.log('\n📥 RESPONSE LENGTH:', responseText.length);
        console.log('📥 RESPONSE TYPE:', typeof responseText);
        
        // Tentar fazer parse apenas para debug
        try {
            const jsonResponse = JSON.parse(responseText);
            console.log('\n📥 RESPONSE PARSED:');
            console.log(JSON.stringify(jsonResponse, null, 2));
            
            console.log('\n🔍 ANÁLISE DETALHADA:');
            console.log('- code:', jsonResponse.code);
            console.log('- msg:', jsonResponse.msg);
            console.log('- data type:', typeof jsonResponse.data);
            console.log('- data is array:', Array.isArray(jsonResponse.data));
            console.log('- data length:', jsonResponse.data ? jsonResponse.data.length : 'N/A');
            console.log('- data content:', jsonResponse.data);
            
            if (jsonResponse.data && Array.isArray(jsonResponse.data) && jsonResponse.data.length === 0) {
                console.log('\n🎯 CONCLUSÃO: API retornou sucesso mas IMEI não encontrado');
                console.log('   - code: 0 = sucesso');
                console.log('   - msg: ok = sem erros');
                console.log('   - data: [] = nenhum dispositivo encontrado');
                console.log('   - Significa: IMEI não está cadastrado na base da JimiCloud');
            }
        } catch (parseError) {
            console.log('\n❌ ERRO no parse JSON:', parseError.message);
        }
        
    } catch (error) {
        console.log('\n💥 ERRO NA REQUISIÇÃO:', error.message);
        console.log('Stack trace:', error.stack);
    }
    
    console.log('\n============================');
    console.log('🏁 Teste RAW finalizado');
}

// Executar o teste
testeRawAPI().catch(console.error);
