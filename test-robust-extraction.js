// Teste das funções de extração melhoradas
const testDevices = [
    {
        imei: '869247060250500',
        selfCheckParam: 'IMEI:869247060250500; VERSION:C450Pro_2.0.13_20250410; SERVER:164.152.62.67:21122,NA:NA; APN:portoconecta.br,724,54; CSQ:-101dbm 15asu; POWER:27.89; ICCID:89555480000040641041; IMSI:724548003067792; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:101; URLTYPE:2',
        log: 'NETWORK:4g Connected, CH1:Normal, CH2:Normal, CH3:Normal, CH4:Normal, CH5:Not_exist, GPS:Success Positioned(13), MEMORY:2.75 GB/2.05 GB, SD1:238 GB/2.01 GB, SD2:238 GB/2.13 GB, ACC:ON, POWER:27.78, CPU_TEMP:44, DMS:1/1/NA, ADAS:1/0/320/271/NA/true',
        parsedSelfCheck: {
            URLTYPE: '2',
            WAKEMODE: '101',
            APN: 'portoconecta.br,724,54'
        }
    },
    {
        imei: '869247060250501',
        selfCheckParam: 'IMEI:869247060250501; VERSION:C450Pro_2.0.10_20250101; urltype:1; wakemode:102',
        log: 'NETWORK:3g Connected, DMS:0/0/NA, ADAS:0/0/NA/NA/2100/100/1010/1000/1800/NA/false'
    },
    {
        imei: '869247060250502',
        selfCheckParam: null,
        log: null,
        server: '192.168.1.100:8080'
    }
];

// Funções de extração robustas (copiadas da implementação)
function extractURLTYPE(device) {
    const sources = [
        device.selfCheckParam,
        device.parsedSelfCheck?.URLTYPE,
        device.log
    ];

    for (const source of sources) {
        if (!source) continue;
        
        const patterns = [
            /URLTYPE:([^;,\s]+)/i,
            /urltype[:\s=]+([^;,\s]+)/i,
            /"urltype"[:\s]*([^;,\s"]+)/i
        ];

        for (const pattern of patterns) {
            const match = String(source).match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
    }
    
    return 'Não encontrado';
}

function extractWAKEMODE(device) {
    const sources = [
        device.selfCheckParam,
        device.parsedSelfCheck?.WAKEMODE,
        device.log
    ];

    for (const source of sources) {
        if (!source) continue;
        
        const patterns = [
            /WAKEMODE:([^;,\s]+)/i,
            /wakemode[:\s=]+([^;,\s]+)/i,
            /"wakemode"[:\s]*([^;,\s"]+)/i,
            /wake[_\s]*mode[:\s=]+([^;,\s]+)/i
        ];

        for (const pattern of patterns) {
            const match = String(source).match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
    }
    
    return 'Não encontrado';
}

function extractDMSSW1(device) {
    const sources = [
        device.log,
        device.selfCheckParam,
        JSON.stringify(device)
    ];

    for (const source of sources) {
        if (!source) continue;
        
        const patterns = [
            /DMS:([^,\s;]+)/i,
            /dms[:\s=]+([^,\s;]+)/i,
            /"dms"[:\s]*"?([^,\s;"]+)/i
        ];

        for (const pattern of patterns) {
            const match = String(source).match(pattern);
            if (match && match[1]) {
                const dmsParts = match[1].split('/');
                if (dmsParts.length >= 2) {
                    return `${dmsParts[0]}/${dmsParts[1]}`;
                } else if (dmsParts.length === 1) {
                    return dmsParts[0];
                }
            }
        }
    }
    
    return 'Não encontrado';
}

console.log('=== TESTE DAS FUNÇÕES DE EXTRAÇÃO MELHORADAS ===\n');

testDevices.forEach((device, index) => {
    console.log(`📱 DEVICE ${index + 1} (IMEI: ${device.imei}):`);
    console.log('  URLTYPE:', extractURLTYPE(device));
    console.log('  WAKEMODE:', extractWAKEMODE(device));
    console.log('  DMS (DMSSW,1,0):', extractDMSSW1(device));
    console.log('');
});

console.log('=== MELHORIAS IMPLEMENTADAS ===');
console.log('✅ Busca robusta em múltiplos campos e formatos');
console.log('✅ Sistema de debounce para evitar múltiplos cliques');
console.log('✅ Circuit breaker mais permissivo (10 falhas, 5min timeout)');
console.log('✅ Melhor tratamento de erros 500/502/503');
console.log('✅ Delays progressivos entre lotes para não sobrecarregar API');
