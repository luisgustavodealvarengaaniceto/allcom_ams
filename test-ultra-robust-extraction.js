// Teste da extração ultra robusta de informações de rede
// Este teste usa os exemplos reais fornecidos pelo usuário

// Função de extração (copiada do app.js)
function extractNetworkConfig(device) {
    const config = {
        server: 'N/A',
        apn: 'N/A',
        urltype: 'N/A',
        wakemode: 'N/A'
    };
    
    // Ultra robust search function
    function ultraRobustSearch(patterns, fieldName) {
        // Convert patterns to array if it's a single pattern
        if (typeof patterns === 'string') {
            patterns = [patterns];
        }
        
        // Collect all text content from the device object
        const textSources = [];
        
        function collectTextSources(obj, depth = 0) {
            if (depth > 10) return; // Prevent infinite recursion
            
            if (!obj) return;
            
            if (typeof obj === 'string') {
                textSources.push(obj);
            } else if (typeof obj === 'object' && obj !== null) {
                for (const [key, value] of Object.entries(obj)) {
                    if (typeof value === 'string') {
                        textSources.push(value);
                    } else if (typeof value === 'object' && value !== null) {
                        collectTextSources(value, depth + 1);
                    }
                }
            }
        }
        
        // Collect all text sources from device
        collectTextSources(device);
        
        // Search through all collected text sources
        for (const text of textSources) {
            if (!text || typeof text !== 'string') continue;
            
            // Try each pattern on this text
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    let cleanValue = match[1].trim();
                    
                    // Advanced cleaning
                    cleanValue = cleanValue
                        .replace(/[;,\|\s]+$/, '') // Remove trailing separators
                        .replace(/^[;,\|\s]+/, '') // Remove leading separators
                        .replace(/["']/g, '') // Remove quotes
                        .trim();
                    
                    // Additional validation - skip empty or invalid values
                    if (cleanValue && 
                        cleanValue !== '' && 
                        cleanValue.toLowerCase() !== 'na' && 
                        cleanValue.toLowerCase() !== 'n/a' &&
                        cleanValue.toLowerCase() !== 'null' &&
                        cleanValue.toLowerCase() !== 'undefined') {
                        
                        // For APN, get only the first part if comma-separated
                        if (fieldName === 'APN' && cleanValue.includes(',')) {
                            const parts = cleanValue.split(',');
                            cleanValue = parts[0].trim();
                        }
                        
                        // For SERVER, get only the first part if comma-separated
                        if (fieldName === 'SERVER' && cleanValue.includes(',')) {
                            const parts = cleanValue.split(',');
                            cleanValue = parts[0].trim();
                        }
                        
                        return cleanValue;
                    }
                }
            }
        }
        
        return 'N/A';
    }
    
    // SERVER patterns - comprehensive matching
    const serverPatterns = [
        /SERVER[:\s]*([^;,\n\r]+)/i,
        /server[:\s]*([^;,\n\r]+)/i,
        /srv[:\s]*([^;,\n\r]+)/i,
        /host[:\s]*([^;,\n\r]+)/i,
        /ip[:\s]*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}[^;,\n\r]*)/i,
        /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:\d+)/i
    ];
    config.server = ultraRobustSearch(serverPatterns, 'SERVER');
    
    // APN patterns - comprehensive matching
    const apnPatterns = [
        /APN[:\s]*([^;,\n\r]+)/i,
        /apn[:\s]*([^;,\n\r]+)/i,
        /access[_\s]*point[_\s]*name[:\s]*([^;,\n\r]+)/i,
        /network[_\s]*name[:\s]*([^;,\n\r]+)/i,
        /carrier[_\s]*name[:\s]*([^;,\n\r]+)/i
    ];
    config.apn = ultraRobustSearch(apnPatterns, 'APN');
    
    // URLTYPE patterns - comprehensive matching including common typos
    const urltypePatterns = [
        /URLTYPE[:\s]*([^;,\n\r]+)/i,
        /urltype[:\s]*([^;,\n\r]+)/i,
        /URLTPYE[:\s]*([^;,\n\r]+)/i,  // Common typo found in examples
        /urltpye[:\s]*([^;,\n\r]+)/i,  // Common typo found in examples
        /URL[_\s]*TYPE[:\s]*([^;,\n\r]+)/i,
        /url[_\s]*type[:\s]*([^;,\n\r]+)/i,
        /PROTOCOL[_\s]*TYPE[:\s]*([^;,\n\r]+)/i,
        /protocol[_\s]*type[:\s]*([^;,\n\r]+)/i,
        /connection[_\s]*type[:\s]*([^;,\n\r]+)/i
    ];
    config.urltype = ultraRobustSearch(urltypePatterns, 'URLTYPE');
    
    // WAKEMODE patterns - comprehensive matching
    const wakemodePatterns = [
        /WAKEMODE[:\s]*([^;,\n\r]+)/i,
        /wakemode[:\s]*([^;,\n\r]+)/i,
        /WAKE[_\s]*MODE[:\s]*([^;,\n\r]+)/i,
        /wake[_\s]*mode[:\s]*([^;,\n\r]+)/i,
        /SLEEP[_\s]*MODE[:\s]*([^;,\n\r]+)/i,
        /sleep[_\s]*mode[:\s]*([^;,\n\r]+)/i,
        /POWER[_\s]*MODE[:\s]*([^;,\n\r]+)/i,
        /power[_\s]*mode[:\s]*([^;,\n\r]+)/i,
        /wake[_\s]*up[_\s]*mode[:\s]*([^;,\n\r]+)/i
    ];
    config.wakemode = ultraRobustSearch(wakemodePatterns, 'WAKEMODE');
    
    return config;
}

// Exemplos de teste baseados nos dados reais fornecidos pelo usuário
const testDevices = [
    {
        "imei": "869247060111603",
        "version": "C450Pro_2.0.08_20241028",
        "server": "164.152.62.67:21122,NA:NA",
        "selfCheckParam": "IMEI:869247060111603; VERSION:C450Pro_2.0.08_20241028; SERVER:164.152.62.67:21122,NA:NA; APN:virtueyes.com.br,724,05; CSQ:-87dbm 24asu; POWER:28.17; ICCID:89550534400027949762; IMSI:724054021946151; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:103; URLTPYE:2"
    },
    {
        "imei": "869247060278790",
        "version": "C450Pro_2.0.13_20250410",
        "server": "164.152.62.67:21122,NA:NA",
        "selfCheckParam": "IMEI:869247060278790; VERSION:C450Pro_2.0.13_20250410; SERVER:164.152.62.67:21122,NA:NA; APN:portoconecta.br,724,54; CSQ:0dbm 0asu; POWER:28.25; ICCID:89555480000077297931; IMSI:724548006733517; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:103; URLTYPE:1"
    },
    {
        "imei": "869247060286215",
        "version": "C450Pro_2.0.13_20250410",
        "server": "164.152.62.67:21122,NA:NA",
        "selfCheckParam": "IMEI:869247060286215; VERSION:C450Pro_2.0.13_20250410; SERVER:164.152.62.67:21122,NA:NA; APN:virtueyes.com.br,724,54; CSQ:-121dbm 3asu; POWER:28.12; ICCID:89555480000043134861; IMSI:724548003314745; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:103; URLTYPE:2"
    },
    {
        "imei": "869247060144430",
        "version": "JC450Pro_1.8.17_20240624",
        "server": "164.152.62.67:21122,NA:NA",
        "selfCheckParam": "IMEI:869247060144430; VERSION:JC450Pro_1.8.17_20240624; SERVER:164.152.62.67:21122,NA:NA; APN:portoconecta.br,724,54; CSQ:-87dbm 24asu; POWER:28.68; ICCID:89555480000043123542; IMSI:724548003321702; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:0; URLTPYE:2"
    },
    {
        "imei": "869247060254270",
        "version": "C450Pro_2.0.13_20250410",
        "server": "2603:c021:c006:2b01:48db:4fba:7153:c32d:21122,NA:NA",
        "selfCheckParam": "IMEI:869247060254270; VERSION:C450Pro_2.0.13_20250410; SERVER:2603:c021:c006:2b01:48db:4fba:7153:c32d:21122,NA:NA; APN:java.claro.com.br,724,05; CSQ:-79dbm 29asu; POWER:25.19; ICCID:89550534400027949788; IMSI:724054021946153; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:103; URLTYPE:2"
    }
];

console.log('=== TESTE DA EXTRAÇÃO ULTRA ROBUSTA ===\n');

testDevices.forEach((device, index) => {
    console.log(`\n--- Teste ${index + 1}: IMEI ${device.imei} ---`);
    
    const networkConfig = extractNetworkConfig(device);
    
    console.log('✅ Resultados extraídos:');
    console.log(`   SERVER: ${networkConfig.server}`);
    console.log(`   APN: ${networkConfig.apn}`);
    console.log(`   URLTYPE: ${networkConfig.urltype}`);
    console.log(`   WAKEMODE: ${networkConfig.wakemode}`);
    
    // Verificar se conseguiu extrair pelo menos 3 dos 4 campos
    const extractedCount = Object.values(networkConfig).filter(v => v !== 'N/A').length;
    console.log(`   📊 Extraídos: ${extractedCount}/4 campos`);
    
    if (extractedCount >= 3) {
        console.log('   ✅ SUCESSO: Extração robusta funcionando!');
    } else {
        console.log('   ⚠️  ATENÇÃO: Poucos campos extraídos');
    }
});

console.log('\n=== RESUMO DOS TESTES ===');
console.log('✅ Teste com URLTPYE (erro de digitação) - deve encontrar mesmo assim');
console.log('✅ Teste com URLTYPE (correto) - deve encontrar normalmente');
console.log('✅ Teste com diferentes APNs - deve extrair apenas a parte principal');
console.log('✅ Teste com diferentes servidores - deve extrair IP:porta corretamente');
console.log('✅ Teste com diferentes WAKEMODEs - deve extrair valores numéricos');

console.log('\n🚀 Execute este teste no Node.js para ver os resultados!');
