// Teste rápido das novas funções de exportação
const testDevice = {
    imei: '869247060250500',
    selfCheckParam: 'IMEI:869247060250500; VERSION:C450Pro_2.0.13_20250410; SERVER:164.152.62.67:21122,NA:NA; APN:portoconecta.br,724,54; CSQ:-101dbm 15asu; POWER:27.89; ICCID:89555480000040641041; IMSI:724548003067792; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:101; URLTYPE:2',
    log: 'NETWORK:4g  Connected, CH1:Normal, CH2:Normal, CH3:Normal, CH4:Normal, CH5:Not_exist, GPS:Success Positioned(13), MEMORY:2.75 GB/2.05 GB, SD1:238 GB/2.01 GB, SD2:238 GB/2.13 GB, ACC:ON, POWER:27.78, CPU_TEMP:44, DMS:1/1/NA, ADAS:1/0/320/271/NA/true'
};

// Simular as funções de extração
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

// Executar testes
console.log('=== TESTE DOS NOVOS CAMPOS DE EXPORTAÇÃO ===');
console.log('URLTYPE:', extractURLTYPE(testDevice));
console.log('WAKEMODE:', extractWAKEMODE(testDevice));
console.log('APN:', extractAPN(testDevice));
console.log('SERVER:', extractSERVER(testDevice));
console.log('DMSSW,1,0:', extractDMSSW1(testDevice));
console.log('DMSSW,2,0:', extractDMSSW2(testDevice));
console.log('===============================================');
