const fetch = require('node-fetch');

// Configuração da API
const CONFIG = {
    API_ENDPOINT: 'http://fota-api.jimicloud.com',
    JIMICLOUD_APP_KEY: 'Jimiiotbrasil',
    JIMICLOUD_SECRET: '23dd6cca658b4ec298aeb7beb4972fd4'
};

async function testAuth() {
    console.log('🔍 Testando autenticação da API JimiCloud...');
    
    try {
        const response = await fetch(`${CONFIG.API_ENDPOINT}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                appKey: CONFIG.JIMICLOUD_APP_KEY,
                secret: CONFIG.JIMICLOUD_SECRET
            })
        });

        console.log('📡 Status da resposta:', response.status);
        console.log('📋 Headers:', Object.fromEntries(response.headers));
        
        const responseText = await response.text();
        console.log('📄 Resposta completa:', responseText);
        
        if (response.ok) {
            const tokenData = JSON.parse(responseText);
            console.log('✅ Autenticação bem-sucedida!');
            console.log('🔑 Token data:', tokenData);
            
            // Testar consulta com um IMEI
            if (tokenData.data && tokenData.data.token) {
                console.log('\n🔍 Testando consulta de dispositivo...');
                await testDeviceQuery(tokenData.data.token);
            }
        } else {
            console.log('❌ Falha na autenticação!');
        }
        
    } catch (error) {
        console.error('❌ Erro na autenticação:', error.message);
    }
}

async function testDeviceQuery(token) {
    try {
        const testImei = '869247060049894'; // Primeiro IMEI do log
        
        const response = await fetch(`${CONFIG.API_ENDPOINT}/queryDeviceStatus`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ imeiList: [testImei] })
        });

        console.log('📡 Status da consulta:', response.status);
        
        const responseText = await response.text();
        console.log('📄 Resposta da consulta:', responseText);
        
        if (response.ok) {
            const queryData = JSON.parse(responseText);
            console.log('✅ Consulta bem-sucedida!');
            console.log('📊 Dados do dispositivo:', queryData);
        } else {
            console.log('❌ Falha na consulta!');
        }
        
    } catch (error) {
        console.error('❌ Erro na consulta:', error.message);
    }
}

testAuth();
