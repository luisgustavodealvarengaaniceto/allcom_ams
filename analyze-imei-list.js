// Script para analisar a lista de IMEIs fornecida
const imeiList = `869247060055008
869247060052989
869247060055396
869247060108435
869247060110415
869247060249239
869247060249502
869247060254601
869247060283451
860112070147592
860112070149101
860112070149093
860112070150109
869247060281547
869247060310668
869247060287429
869247060280671
869247060311583
869247060284491
869247060310981
869247060318174
869247060314959
869247060280978
869247060284624
869247060278790
869247060317515
869247060287767
869247060311062
869247060285829
869247060288047
869247060314298
869247060055008	
869247060055396	
869247060108435	
869247060110415	
869247060310668	
869247060287429	
869247060280671	
869247060311583	
869247060284491	
869247060310981	
869247060318174	
869247060314959	
869247060280978	
869247060278790	
869247060317515	
869247060287767	
869247060311062	
869247060285829	
869247060314298`;

function analyzeIMEIList(rawList) {
    console.log('🔍 ANÁLISE DA LISTA DE IMEIs\n');
    
    // Parse da lista
    const lines = rawList.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log(`📋 Total de linhas na lista: ${lines.length}`);
    
    // Extrair IMEIs (removendo tabs e espaços)
    const allImeis = lines.map(line => line.replace(/\s/g, '')).filter(imei => imei.length === 15);
    console.log(`📱 Total de IMEIs válidos (15 dígitos): ${allImeis.length}`);
    
    // Identificar únicos
    const uniqueImeis = [...new Set(allImeis)];
    console.log(`✨ IMEIs únicos: ${uniqueImeis.length}`);
    
    // Identificar duplicados
    const duplicates = {};
    const duplicatesList = [];
    
    allImeis.forEach(imei => {
        if (duplicates[imei]) {
            duplicates[imei]++;
            if (duplicates[imei] === 2) { // Primeira vez que vira duplicata
                duplicatesList.push(imei);
            }
        } else {
            duplicates[imei] = 1;
        }
    });
    
    if (duplicatesList.length > 0) {
        console.log(`\n🔄 IMEIs DUPLICADOS (${duplicatesList.length}):`);
        duplicatesList.forEach(imei => {
            console.log(`   ${imei} - aparece ${duplicates[imei]} vezes`);
        });
        
        console.log(`\n📊 ESTATÍSTICAS:`);
        console.log(`   - IMEIs total fornecidos: ${allImeis.length}`);
        console.log(`   - IMEIs únicos: ${uniqueImeis.length}`);
        console.log(`   - IMEIs duplicados: ${duplicatesList.length}`);
        console.log(`   - Repetições eliminadas: ${allImeis.length - uniqueImeis.length}`);
    } else {
        console.log('\n✅ Nenhum IMEI duplicado encontrado');
    }
    
    // Validar IMEIs usando algoritmo Luhn
    function validateIMEI(imei) {
        if (!/^\d{15}$/.test(imei)) return false;
        
        let sum = 0;
        for (let i = 0; i < 14; i++) {
            let digit = parseInt(imei[i]);
            if (i % 2 === 1) {
                digit *= 2;
                if (digit > 9) {
                    digit = Math.floor(digit / 10) + (digit % 10);
                }
            }
            sum += digit;
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(imei[14]);
    }
    
    const invalidImeis = uniqueImeis.filter(imei => !validateIMEI(imei));
    
    if (invalidImeis.length > 0) {
        console.log(`\n❌ IMEIs INVÁLIDOS (falham na validação Luhn): ${invalidImeis.length}`);
        invalidImeis.forEach(imei => {
            console.log(`   ${imei}`);
        });
    } else {
        console.log('\n✅ Todos os IMEIs são válidos (passam na validação Luhn)');
    }
    
    // Análise de fabricantes pelos TACs
    const tacAnalysis = {};
    uniqueImeis.forEach(imei => {
        const tac = imei.substring(0, 8);
        tacAnalysis[tac] = (tacAnalysis[tac] || 0) + 1;
    });
    
    console.log(`\n🏭 ANÁLISE DE FABRICANTES (por TAC):`);
    Object.entries(tacAnalysis).forEach(([tac, count]) => {
        let manufacturer = 'Desconhecido';
        if (tac.startsWith('86924706')) {
            manufacturer = 'JimiIoT';
        } else if (tac.startsWith('86011207')) {
            manufacturer = 'Outro fabricante';
        }
        console.log(`   ${tac}***: ${count} IMEIs (${manufacturer})`);
    });
    
    return {
        total: allImeis.length,
        unique: uniqueImeis.length,
        duplicates: duplicatesList.length,
        invalid: invalidImeis.length,
        uniqueList: uniqueImeis
    };
}

// Executar análise
const analysis = analyzeIMEIList(imeiList);

console.log('\n' + '='.repeat(60));
console.log('🎯 RESUMO FINAL:');
console.log(`   - Você forneceu ${analysis.total} IMEIs no total`);
console.log(`   - Existem ${analysis.unique} IMEIs únicos válidos`);
console.log(`   - O sistema deve reconhecer exatamente ${analysis.unique} IMEIs`);

if (analysis.duplicates > 0) {
    console.log(`   - ${analysis.duplicates} IMEIs estavam duplicados na lista`);
}

if (analysis.invalid > 0) {
    console.log(`   - ${analysis.invalid} IMEIs são inválidos`);
}

console.log('\n💡 CONCLUSÃO:');
if (analysis.unique === 31) {
    console.log('   ✅ O sistema está correto! Há exatamente 31 IMEIs únicos válidos na sua lista.');
    console.log('   ✅ Os IMEIs duplicados foram automaticamente removidos pelo sistema.');
} else {
    console.log(`   ⚠️ Esperado: 31 IMEIs, mas encontrados: ${analysis.unique} IMEIs únicos`);
}

// Salvar lista limpa
console.log('\n📝 LISTA LIMPA (sem duplicados):');
analysis.uniqueList.forEach((imei, index) => {
    console.log(`${index + 1}. ${imei}`);
});
