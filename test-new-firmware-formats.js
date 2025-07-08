// Script para testar os novos formatos de firmware
console.log('🧪 === TESTE DOS NOVOS FORMATOS DE FIRMWARE ===');

// Testar parsing com diferentes formatos
const firmwares = [
    'C450Pro_2.0.16_20250526',  // Novo formato (8 dígitos)
    'C450Pro_2.0.13_20250410',  // Novo formato (8 dígitos)
    'C450Pro_2.0.08_20241028',  // Novo formato (8 dígitos)
    'C450pro_2.0.16_250526',    // Formato antigo (6 dígitos)
    'C450Pro_2.0.13_250410',    // Formato antigo (6 dígitos)
    'C450Pro_V2.0.16_20250526', // Com V e 8 dígitos
    'C450pro_V2.0.13_250410'    // Com V e 6 dígitos
];

// Função de parsing (igual à do firmware-manager.js)
function testParseFirmware(firmware) {
    if (!firmware || typeof firmware !== 'string') {
        return null;
    }

    const pattern = /C450[Pp]ro_V?(\d+)\.(\d+)\.(\d+)_(\d{6,8})/;
    const match = firmware.match(pattern);
    
    if (!match) {
        return null;
    }

    const [, major, minor, patch, date] = match;
    
    // Convert date to actual date
    let year, month, day;
    if (date.length === 8) {
        // YYYYMMDD format
        year = parseInt(date.substring(0, 4));
        month = parseInt(date.substring(4, 6)) - 1;
        day = parseInt(date.substring(6, 8));
    } else {
        // YYMMDD format
        year = 2000 + parseInt(date.substring(0, 2));
        month = parseInt(date.substring(2, 4)) - 1;
        day = parseInt(date.substring(4, 6));
    }
    
    return {
        original: firmware,
        major: parseInt(major),
        minor: parseInt(minor), 
        patch: parseInt(patch),
        date: new Date(year, month, day),
        dateString: date,
        isValid: true
    };
}

firmwares.forEach(fw => {
    console.log(`\n🧪 Testando: ${fw}`);
    const parsed = testParseFirmware(fw);
    
    if (parsed) {
        console.log(`  ✅ Parse OK: v${parsed.major}.${parsed.minor}.${parsed.patch}`);
        console.log(`  📅 Data: ${parsed.date.toLocaleDateString('pt-BR')}`);
        console.log(`  📋 Data string: ${parsed.dateString} (${parsed.dateString.length} dígitos)`);
    } else {
        console.log(`  ❌ Parse falhou`);
    }
});

console.log('\n✨ Teste concluído!');
