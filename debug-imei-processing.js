// Debug script para investigar processamento de 32 IMEIs
console.log('🔍 Debug: Investigando processamento de IMEIs');

// IMEIs fornecidos pelo usuário
const userImeis = [
    '869247060055008',
    '869247060052989',
    '869247060055396',
    '869247060108435',
    '869247060110415',
    '869247060249239',
    '869247060249502',
    '869247060254601',
    '869247060283451',
    '860112070147592',
    '860112070149101',
    '860112070149093',
    '860112070150109',
    '869247060281547',
    '869247060310668',
    '869247060287429',
    '869247060280671',
    '869247060311583',
    '869247060284491',
    '869247060310981',
    '869247060318174',
    '869247060314959',
    '869247060280978',
    '869247060284624',
    '869247060278790',
    '869247060317515',
    '869247060287767',
    '869247060311062',
    '869247060285829',
    '869247060288047',
    '869247060314298'
];

console.log(`📊 Total de IMEIs fornecidos: ${userImeis.length}`);

// Função de validação IMEI (replicada do app.js)
function isValidImei(imei) {
    return /^\d{15}$/.test(imei);
}

// Testar validação de cada IMEI
console.log('\n📋 Validando cada IMEI:');
const validImeis = [];
const invalidImeis = [];

userImeis.forEach((imei, index) => {
    const isValid = isValidImei(imei);
    console.log(`${String(index + 1).padStart(2, ' ')}. ${imei} - ${isValid ? 'Válido' : 'Inválido'}`);
    
    if (isValid) {
        validImeis.push(imei);
    } else {
        invalidImeis.push(imei);
    }
});

console.log(`\nIMEIs válidos: ${validImeis.length}`);
console.log(`IMEIs inválidos: ${invalidImeis.length}`);

if (invalidImeis.length > 0) {
    console.log('\nIMEIs inválidos encontrados:');
    invalidImeis.forEach((imei, index) => {
        console.log(`   ${index + 1}. ${imei} (${imei.length} dígitos)`);
    });
}

// Verificar duplicatas
const uniqueImeis = [...new Set(validImeis)];
const duplicates = validImeis.length - uniqueImeis.length;

console.log(`\nDuplicatas removidas: ${duplicates}`);
console.log(`IMEIs únicos e válidos: ${uniqueImeis.length}`);

// Simular criação de lotes
const maxBatchSize = 99; // Configuração do sistema
const batches = [];
for (let i = 0; i < uniqueImeis.length; i += maxBatchSize) {
    batches.push(uniqueImeis.slice(i, i + maxBatchSize));
}

console.log(`\nDivisão em lotes:`);
console.log(`   - Tamanho máximo do lote: ${maxBatchSize}`);
console.log(`   - Número de lotes: ${batches.length}`);
batches.forEach((batch, index) => {
    console.log(`   - Lote ${index + 1}: ${batch.length} IMEIs`);
});

// Verificar possíveis problemas
console.log('\nPossíveis causas para retornar apenas 15 resultados:');

if (invalidImeis.length > 0) {
    console.log(`   1. ${invalidImeis.length} IMEIs inválidos foram filtrados`);
}

if (duplicates > 0) {
    console.log(`   2. ${duplicates} IMEIs duplicados foram removidos`);
}

console.log('   3. Falha na API - nem todos os IMEIs retornaram dados');
console.log('   4. Timeout na requisição');
console.log('   5. Erro no processamento da resposta da API');
console.log('   6. Limit na API (máximo de retornos por requisição)');

// Análise de padrões nos IMEIs
console.log('\nAnálise de padrões nos IMEIs:');
const patterns = {};
validImeis.forEach(imei => {
    const prefix = imei.substring(0, 6);
    patterns[prefix] = (patterns[prefix] || 0) + 1;
});

console.log('   Prefixos encontrados:');
Object.entries(patterns).forEach(([prefix, count]) => {
    console.log(`     - ${prefix}***: ${count} IMEIs`);
});

console.log('\nPróximos passos recomendados:');
console.log('   1. Verificar logs da API no navegador (F12 -> Network)');
console.log('   2. Testar com um lote menor (ex: 5-10 IMEIs)');
console.log('   3. Verificar se há limite na API JimiCloud');
console.log('   4. Analisar resposta completa da API');
console.log('   5. Verificar circuit breaker e performance manager');

console.log('\nResumo:');
console.log(`   - IMEIs fornecidos: ${userImeis.length}`);
console.log(`   - IMEIs válidos únicos: ${uniqueImeis.length}`);
console.log(`   - Esperados na resposta: ${uniqueImeis.length}`);
console.log(`   - Recebidos: 15`);
console.log(`   - Diferença: ${uniqueImeis.length - 15}`);
