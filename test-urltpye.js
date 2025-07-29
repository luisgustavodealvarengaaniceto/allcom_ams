// Teste para o caso específico com URLTPYE (erro de digitação)
const testDevice = {
    imei: '869247060251664',
    selfCheckParam: 'IMEI:869247060251664; VERSION:JC450Pro_1.8.17_20240624; SERVER:164.152.62.67:21122,NA:NA; APN:portoconecta.br,724,54; CSQ:-80dbm 28asu; POWER:24.78; ICCID:89555480000043123591; IMSI:724548003324402; TIMER:10; COMVER:EC25AUXGAR08A07M1G_01.001.01.001; BCD:0; WAKEMODE:101; URLTPYE:2'
};

// Função de extração com o novo padrão
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
            /URLTPYE:([^;,\s]+)/i,  // Erro de digitação comum na API
            /urltype[:\s=]+([^;,\s]+)/i,
            /urltpye[:\s=]+([^;,\s]+)/i,
            /"urltype"[:\s]*([^;,\s"]+)/i,
            /"urltpye"[:\s]*([^;,\s"]+)/i
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

console.log('=== TESTE DO ERRO DE DIGITAÇÃO URLTPYE ===');
console.log('IMEI:', testDevice.imei);
console.log('selfCheckParam:', testDevice.selfCheckParam);
console.log('URLTYPE extraído:', extractURLTYPE(testDevice));
console.log('✅ Agora detecta tanto URLTYPE quanto URLTPYE!');
