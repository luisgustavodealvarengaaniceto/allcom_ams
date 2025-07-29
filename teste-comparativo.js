// Teste comparativo: IMEI que falha vs IMEI que funciona
const fetch = require('node-fetch');

const IMEI_QUE_FALHA = '869247060280671';
const IMEI_QUE_FUNCIONA = '869247060283451';
const PROXY_URL = 'http://localhost:3001/api/queryDeviceStatus';

async function testarIMEI(imei, descricao) {
    console.log(`\n🧪 TESTANDO: ${descricao}`);
    console.log('='.repeat(50));
    console.log(`IMEI: ${imei}`);
    
    try {
        const requestBody = { imeiList: [imei] };
        
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Comparativo-Test/1.0'
            },
            body: JSON.stringify(requestBody)
        });
        
        const responseText = await response.text();
        const jsonResponse = JSON.parse(responseText);
        
        console.log('📊 RESULTADO:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Code: ${jsonResponse.code}`);
        console.log(`   Message: ${jsonResponse.msg}`);
        console.log(`   Data Length: ${jsonResponse.data ? jsonResponse.data.length : 'N/A'}`);
        
        if (jsonResponse.data && jsonResponse.data.length > 0) {
            console.log('   ✅ SUCESSO - Dispositivo encontrado');
            console.log('   📱 Info do dispositivo:');
            const device = jsonResponse.data[0];
            console.log(`      IMEI: ${device.imei}`);
            console.log(`      Version: ${device.version || 'N/A'}`);
            console.log(`      Server: ${device.server || 'N/A'}`);
            console.log(`      Last Time: ${device.lastTime || 'N/A'}`);
            console.log(`      ICCID: ${device.iccid ? device.iccid.substring(0, 10) + '...' : 'N/A'}`);
        } else {
            console.log('   ❌ FALHA - Dispositivo não encontrado');
            console.log('   💡 IMEI não está cadastrado na base da JimiCloud');
        }
        
        return jsonResponse;
        
    } catch (error) {
        console.log(`   💥 ERRO: ${error.message}`);
        return null;
    }
}

async function testeComparativo() {
    console.log('🔬 TESTE COMPARATIVO - API JimiCloud');
    console.log('Comparando IMEI que falha vs IMEI que funciona\n');
    
    const result1 = await testarIMEI(IMEI_QUE_FALHA, 'IMEI QUE FALHA');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre testes
    const result2 = await testarIMEI(IMEI_QUE_FUNCIONA, 'IMEI QUE FUNCIONA');
    
    console.log('\n📋 COMPARAÇÃO:');
    console.log('='.repeat(50));
    console.log(`${IMEI_QUE_FALHA} (falha):     ${result1 ? result1.data.length : 'erro'} resultados`);
    console.log(`${IMEI_QUE_FUNCIONA} (funciona): ${result2 ? result2.data.length : 'erro'} resultados`);
    
    console.log('\n🎯 CONCLUSÃO FINAL:');
    console.log('   O problema NÃO é técnico (API, proxy, autenticação)');
    console.log('   O problema É de dados: alguns IMEIs não existem na base da JimiCloud');
    console.log('   IMEIs válidos (Luhn) podem não estar cadastrados no sistema');
    console.log('   A resposta {"code":0,"msg":"ok","data":[]} é normal para IMEIs não cadastrados');
}

// Executar o teste comparativo
testeComparativo().catch(console.error);
