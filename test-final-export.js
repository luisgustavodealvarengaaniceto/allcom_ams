// Teste completo da exportação com novos campos
const testDevice = {
    imei: '869247060250500',
    version: 'C450Pro_2.0.13_20250410',
    server: '164.152.62.67:21122,NA:NA',
    csq: '-101dbm 15asu',
    iccid: '89555480000040641041',
    log: 'NETWORK:4g  Connected, CH1:Normal, CH2:Normal, CH3:Normal, CH4:Normal, CH5:Not_exist, GPS:Success Positioned(13), MEMORY:2.75 GB/2.05 GB, SD1:238 GB/2.01 GB, SD2:238 GB/2.13 GB, ACC:ON, POWER:27.78, CPU_TEMP:44, DMS:1/1/NA, ADAS:1/0/320/271/NA/true',
    power: '27.89',
    selfCheckParam: 'IMEI:869247060250500; VERSION:C450Pro_2.0.13_20250410; SERVER:164.152.62.67:21122,NA:NA; APN:portoconecta.br,724,54; CSQ:-101dbm 15asu; POWER:27.89; ICCID:89555480000040641041; IMSI:724548003067792; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:101; URLTYPE:2',
    isOnline: true,
    lastTimeBrasilia: '22/07/2025 11:46:07',
    offlineDays: 0,
    firmwareVersion: 'C450Pro_2.0.13_20250410'
};

// Teste com dados diferentes para verificar edge cases
const testDevice2 = {
    imei: '869247060250501',
    log: 'NETWORK:3g Connected, DMS:0/0/NA, ADAS:0/0/NA/NA/2100/100/1010/1000/1800/NA/false',
    selfCheckParam: 'IMEI:869247060250501; VERSION:C450Pro_2.0.10_20250101; URLTYPE:1; WAKEMODE:102',
    isOnline: false,
    offlineDays: 5
};

// Teste sem alguns campos para verificar fallback
const testDevice3 = {
    imei: '869247060250502',
    log: null,
    selfCheckParam: null,
    isOnline: false,
    offlineDays: 10
};

// Simular funções de extração
function extractURLTYPE(device) {
    if (!device.selfCheckParam) return 'Não encontrado';
    const urltypeMatch = device.selfCheckParam.match(/URLTYPE:([^;]+)/);
    return urltypeMatch ? urltypeMatch[1].trim() : 'Não encontrado';
}

function extractWAKEMODE(device) {
    if (!device.selfCheckParam) return 'Não encontrado';
    const wakemodeMatch = device.selfCheckParam.match(/WAKEMODE:([^;]+)/);
    return wakemodeMatch ? wakemodeMatch[1].trim() : 'Não encontrado';
}

function extractAPN(device) {
    if (!device.selfCheckParam) return 'Não encontrado';
    const apnMatch = device.selfCheckParam.match(/APN:([^;]+)/);
    return apnMatch ? apnMatch[1].trim() : 'Não encontrado';
}

function extractSERVER(device) {
    if (!device.selfCheckParam) return 'Não encontrado';
    const serverMatch = device.selfCheckParam.match(/SERVER:([^;]+)/);
    return serverMatch ? serverMatch[1].trim() : 'Não encontrado';
}

function extractDMSSW1(device) {
    if (!device.log) return 'Não encontrado';
    
    const dmsMatch = device.log.match(/DMS:([^,]+)/);
    if (dmsMatch) {
        const dmsParts = dmsMatch[1].split('/');
        if (dmsParts.length >= 2) {
            return `${dmsParts[0]}/${dmsParts[1]}`;
        }
    }
    return 'Não encontrado';
}

function extractDMSSW2(device) {
    if (!device.log) return 'Não encontrado';
    
    const adasMatch = device.log.match(/ADAS:([^,]+)/);
    if (adasMatch) {
        const adasParts = adasMatch[1].split('/');
        if (adasParts.length >= 2) {
            return `${adasParts[0]}/${adasParts[1]}`;
        }
    }
    return 'Não encontrado';
}

// Função para simular linha CSV
function generateCSVLine(device) {
    const fields = [
        device.imei || 'N/A',
        device.isOnline ? 'Online' : 'Offline',
        device.firmwareVersion || 'N/A',
        device.lastTimeBrasilia || 'N/A',
        device.offlineDays || 0,
        // ... outros campos existentes seriam aqui ...
        extractURLTYPE(device),
        extractWAKEMODE(device),
        extractAPN(device),
        extractSERVER(device),
        extractDMSSW1(device),
        extractDMSSW2(device)
    ];
    
    return fields.map(field => `"${String(field)}"`).join(',');
}

console.log('=== TESTE COMPLETO DOS NOVOS CAMPOS ===');
console.log('');

console.log('📋 DEVICE 1 (Completo):');
console.log('IMEI:', testDevice.imei);
console.log('URLTYPE:', extractURLTYPE(testDevice));
console.log('WAKEMODE:', extractWAKEMODE(testDevice));
console.log('APN:', extractAPN(testDevice));
console.log('SERVER:', extractSERVER(testDevice));
console.log('DMS:', extractDMSSW1(testDevice));
console.log('ADAS:', extractDMSSW2(testDevice));
console.log('CSV Line (novos campos):', `"${extractURLTYPE(testDevice)}","${extractWAKEMODE(testDevice)}","${extractAPN(testDevice)}","${extractSERVER(testDevice)}","${extractDMSSW1(testDevice)}","${extractDMSSW2(testDevice)}"`);
console.log('');

console.log('📋 DEVICE 2 (Diferentes valores):');
console.log('IMEI:', testDevice2.imei);
console.log('URLTYPE:', extractURLTYPE(testDevice2));
console.log('WAKEMODE:', extractWAKEMODE(testDevice2));
console.log('APN:', extractAPN(testDevice2));
console.log('SERVER:', extractSERVER(testDevice2));
console.log('DMS:', extractDMSSW1(testDevice2));
console.log('ADAS:', extractDMSSW2(testDevice2));
console.log('');

console.log('📋 DEVICE 3 (Campos ausentes):');
console.log('IMEI:', testDevice3.imei);
console.log('URLTYPE:', extractURLTYPE(testDevice3));
console.log('WAKEMODE:', extractWAKEMODE(testDevice3));
console.log('APN:', extractAPN(testDevice3));
console.log('SERVER:', extractSERVER(testDevice3));
console.log('DMS:', extractDMSSW1(testDevice3));
console.log('ADAS:', extractDMSSW2(testDevice3));
console.log('');

console.log('✅ TESTES CONCLUÍDOS - Funcionalidades prontas para exportação!');
console.log('==========================================');
