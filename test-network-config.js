// Teste para validar a extração das informações de rede
const testDevice = {
    imei: "868120302622664",
    version: "C450_v2.1.3",
    lastTime: "2025-01-15 10:30:00",
    log: "NETWORK:4G,GPS:OK,ACC:ON,POWER:12.5V,SERVER:api.example.com:8080,APN:internet.vivo.com.br,URLTYPE:TCP,WAKEMODE:SMS,SD1:233 GB/2.18 GB,SD2:233 GB/2.06 GB",
    selfCheckParam: "VERSION:C450_v2.1.3;SERVER:backup.server.com;APN:tim.br;URLTYPE:UDP;WAKEMODE:CALL;POWER:12.5;NETWORK:4G",
    systemInfo: {
        network: "4G",
        gps: "OK",
        acc: "ON"
    }
};

// Função de extração de configuração de rede
function extractNetworkConfig(device) {
    const config = {
        server: 'N/A',
        apn: 'N/A',
        urltype: 'N/A',
        wakemode: 'N/A'
    };
    
    // Function to search for a pattern in all device properties
    function robustSearch(patterns, fieldName) {
        // Convert patterns to array if it's a single pattern
        if (typeof patterns === 'string') {
            patterns = [patterns];
        }
        
        // Search in all device properties recursively
        function searchInObject(obj, depth = 0) {
            if (depth > 5) return null; // Prevent infinite recursion
            
            if (!obj || typeof obj !== 'object') return null;
            
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    // Try each pattern
                    for (const pattern of patterns) {
                        const match = value.match(pattern);
                        if (match && match[1]) {
                            // Clean the extracted value
                            let cleanValue = match[1].trim();
                            // Remove common separators and extra characters
                            cleanValue = cleanValue.replace(/[;,\|\s]+$/, '').trim();
                            return cleanValue;
                        }
                    }
                } else if (typeof value === 'object' && value !== null) {
                    // Recursively search nested objects
                    const found = searchInObject(value, depth + 1);
                    if (found) return found;
                }
            }
            
            return null;
        }
        
        return searchInObject(device) || 'N/A';
    }
    
    // SERVER patterns - flexible matching with various separators and formats
    const serverPatterns = [
        /SERVER[:\s]*([^;,\|\s]+(?:\.[^;,\|\s]+)*(?::\d+)?)/i,
        /SERVER[:\s]*([^\s;,\|]+)/i,
        /server[:\s]*([^;,\|\s]+(?:\.[^;,\|\s]+)*(?::\d+)?)/i,
        /IP[:\s]*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(?::\d+)?)/i,
        /HOST[:\s]*([^;,\|\s]+(?:\.[^;,\|\s]+)*(?::\d+)?)/i
    ];
    config.server = robustSearch(serverPatterns, 'SERVER');
    
    // APN patterns - flexible matching
    const apnPatterns = [
        /APN[:\s]*([^;,\|\s]+)/i,
        /apn[:\s]*([^;,\|\s]+)/i,
        /ACCESS[_\s]?POINT[_\s]?NAME[:\s]*([^;,\|\s]+)/i
    ];
    config.apn = robustSearch(apnPatterns, 'APN');
    
    // URLTYPE patterns - flexible matching
    const urltypePatterns = [
        /URLTYPE[:\s]*([^;,\|\s]+)/i,
        /urltype[:\s]*([^;,\|\s]+)/i,
        /URL[_\s]?TYPE[:\s]*([^;,\|\s]+)/i,
        /PROTOCOL[_\s]?TYPE[:\s]*([^;,\|\s]+)/i
    ];
    config.urltype = robustSearch(urltypePatterns, 'URLTYPE');
    
    // WAKEMODE patterns - flexible matching
    const wakemodePatterns = [
        /WAKEMODE[:\s]*([^;,\|\s]+)/i,
        /wakemode[:\s]*([^;,\|\s]+)/i,
        /WAKE[_\s]?MODE[:\s]*([^;,\|\s]+)/i,
        /SLEEP[_\s]?MODE[:\s]*([^;,\|\s]+)/i,
        /POWER[_\s]?MODE[:\s]*([^;,\|\s]+)/i
    ];
    config.wakemode = robustSearch(wakemodePatterns, 'WAKEMODE');
    
    return config;
}

// Teste
console.log('=== TESTE DE EXTRAÇÃO DE CONFIGURAÇÃO DE REDE ===');
console.log('Device de teste:', JSON.stringify(testDevice, null, 2));
console.log('');

const networkConfig = extractNetworkConfig(testDevice);
console.log('Configuração extraída:');
console.log('- SERVER:', networkConfig.server);
console.log('- APN:', networkConfig.apn);
console.log('- URLTYPE:', networkConfig.urltype);
console.log('- WAKEMODE:', networkConfig.wakemode);

// Teste com device com informações espalhadas
const testDevice2 = {
    imei: "868120302622665",
    someField: "random data SERVER: main.server.com:9999 more data",
    anotherField: {
        nested: "APN:claro.com.br;URLTYPE:HTTP;WAKEMODE:GPRS"
    },
    log: "OTHER:data,EXTRA:info"
};

console.log('\n=== TESTE COM DADOS ESPALHADOS ===');
const networkConfig2 = extractNetworkConfig(testDevice2);
console.log('Configuração extraída:');
console.log('- SERVER:', networkConfig2.server);
console.log('- APN:', networkConfig2.apn);
console.log('- URLTYPE:', networkConfig2.urltype);
console.log('- WAKEMODE:', networkConfig2.wakemode);

// Teste com dados com espaços extras
const testDevice3 = {
    imei: "868120302622666",
    log: "SERVER:  api.test.com:8080  ,  APN:  vivo.internet  ,  URLTYPE:  TCP  ,  WAKEMODE:  SMS  "
};

console.log('\n=== TESTE COM ESPAÇOS EXTRAS ===');
const networkConfig3 = extractNetworkConfig(testDevice3);
console.log('Configuração extraída:');
console.log('- SERVER:', networkConfig3.server);
console.log('- APN:', networkConfig3.apn);
console.log('- URLTYPE:', networkConfig3.urltype);
console.log('- WAKEMODE:', networkConfig3.wakemode);
