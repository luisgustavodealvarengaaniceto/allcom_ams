// Teste final com casos reais e erros de digitação
const testCases = [
    {
        name: 'Caso Original com URLTYPE correto',
        device: {
            imei: '869247060250500',
            selfCheckParam: 'IMEI:869247060250500; VERSION:C450Pro_2.0.13_20250410; SERVER:164.152.62.67:21122,NA:NA; APN:portoconecta.br,724,54; URLTYPE:2; WAKEMODE:101'
        }
    },
    {
        name: 'Caso com erro URLTPYE',
        device: {
            imei: '869247060251664',
            selfCheckParam: 'IMEI:869247060251664; VERSION:JC450Pro_1.8.17_20240624; SERVER:164.152.62.67:21122,NA:NA; APN:portoconecta.br,724,54; URLTPYE:2; WAKEMODE:101'
        }
    },
    {
        name: 'Caso com múltiplos erros',
        device: {
            imei: '869247060251665',
            selfCheckParam: 'IMEI:869247060251665; VERSION:Test; SEVER:192.168.1.1:8080; APN:test.br; URLTPYE:3; WAKMODE:200'
        }
    }
];

// Funções de extração atualizadas
function extractURLTYPE(device) {
    const sources = [device.selfCheckParam, device.parsedSelfCheck?.URLTYPE, device.log];
    
    for (const source of sources) {
        if (!source) continue;
        
        const patterns = [
            /URLTYPE:([^;,\s]+)/i,
            /URLTPYE:([^;,\s]+)/i,  // Erro de digitação
            /urltype[:\s=]+([^;,\s]+)/i,
            /urltpye[:\s=]+([^;,\s]+)/i
        ];

        for (const pattern of patterns) {
            const match = String(source).match(pattern);
            if (match && match[1]) return match[1].trim();
        }
    }
    return 'Não encontrado';
}

function extractWAKEMODE(device) {
    const sources = [device.selfCheckParam, device.parsedSelfCheck?.WAKEMODE, device.log];
    
    for (const source of sources) {
        if (!source) continue;
        
        const patterns = [
            /WAKEMODE:([^;,\s]+)/i,
            /WAKMODE:([^;,\s]+)/i,  // Erro de digitação
            /wakemode[:\s=]+([^;,\s]+)/i,
            /wakmode[:\s=]+([^;,\s]+)/i
        ];

        for (const pattern of patterns) {
            const match = String(source).match(pattern);
            if (match && match[1]) return match[1].trim();
        }
    }
    return 'Não encontrado';
}

function extractSERVER(device) {
    const sources = [device.selfCheckParam, device.parsedSelfCheck?.SERVER, device.server, device.log];
    
    for (const source of sources) {
        if (!source) continue;
        
        const patterns = [
            /SERVER:([^;,]+)/i,
            /SEVER:([^;,]+)/i,   // Erro de digitação
            /SERVR:([^;,]+)/i,   // Erro de digitação
            /server[:\s=]+([^;,]+)/i,
            /sever[:\s=]+([^;,]+)/i
        ];

        for (const pattern of patterns) {
            const match = String(source).match(pattern);
            if (match && match[1]) return match[1].trim();
        }
    }
    
    if (device.server) return device.server;
    return 'Não encontrado';
}

console.log('=== TESTE FINAL - TOLERÂNCIA A ERROS DE DIGITAÇÃO ===\n');

testCases.forEach((testCase, index) => {
    console.log(`📱 ${testCase.name}:`);
    console.log(`   IMEI: ${testCase.device.imei}`);
    console.log(`   URLTYPE: ${extractURLTYPE(testCase.device)}`);
    console.log(`   WAKEMODE: ${extractWAKEMODE(testCase.device)}`);
    console.log(`   SERVER: ${extractSERVER(testCase.device)}`);
    console.log('');
});

console.log('✅ MELHORIAS IMPLEMENTADAS:');
console.log('   - Detecta URLTYPE e URLTPYE (erro comum na API)');
console.log('   - Detecta WAKEMODE e WAKMODE');
console.log('   - Detecta SERVER, SEVER e SERVR');
console.log('   - Busca case-insensitive em múltiplos formatos');
console.log('   - Sistema robusto contra erros de digitação!');
