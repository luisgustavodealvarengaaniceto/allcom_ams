// Debug script para investigar resposta da API
console.log('🔍 Debug: Investigando resposta da API');

// Função para simular/testar resposta da API
function analyzeApiResponse() {
    console.log('\n📋 Possíveis cenários que causam perda de dados:');
    
    console.log('\n1. 📊 LIMITE DA API JIMICLOUD:');
    console.log('   - A API pode ter limite interno de retornar máximo 15 registros');
    console.log('   - Mesmo enviando 31 IMEIs, retorna apenas os primeiros 15');
    console.log('   - Solução: Dividir em lotes menores (ex: 10-15 IMEIs por vez)');
    
    console.log('\n2. ⏱️ TIMEOUT PARCIAL:');
    console.log('   - Alguns IMEIs demoram mais para processar');
    console.log('   - API retorna apenas os que processou antes do timeout');
    console.log('   - Solução: Aumentar timeout ou reduzir lote');
    
    console.log('\n3. 🔄 ERRO DE PROCESSAMENTO:');
    console.log('   - Alguns IMEIs podem estar inativos/não existir na base');
    console.log('   - API filtra automaticamente IMEIs inexistentes');
    console.log('   - Resultado: Menos equipamentos retornados');
    
    console.log('\n4. 🌐 PROBLEMA DE PROXY/REDE:');
    console.log('   - Perda de dados durante transmissão');
    console.log('   - Resposta truncada');
    console.log('   - Solução: Verificar logs de rede');
    
    console.log('\n5. 🔧 ERRO NO PARSING:');
    console.log('   - Resposta da API está completa');
    console.log('   - Erro na função parseApiResponse()');
    console.log('   - Alguns registros são descartados por formato inválido');
    
    console.log('\n📝 PASSOS PARA DIAGNOSTICAR:');
    console.log('1. Abrir DevTools (F12) → Aba Network');
    console.log('2. Fazer a consulta dos 31 IMEIs');
    console.log('3. Verificar requisição para "queryDeviceStatus"');
    console.log('4. Analisar:');
    console.log('   - Request payload: Contém todos os 31 IMEIs?');
    console.log('   - Response: Quantos registros retornou?');
    console.log('   - Status: 200 OK ou erro?');
    console.log('   - Timing: Tempo de resposta');
    
    console.log('\n🧪 TESTE RECOMENDADO:');
    console.log('Teste dividindo os IMEIs em grupos menores:');
    
    const userImeis = [
        '869247060055008', '869247060052989', '869247060055396', '869247060108435', '869247060110415',
        '869247060249239', '869247060249502', '869247060254601', '869247060283451', '860112070147592',
        '860112070149101', '860112070149093', '860112070150109', '869247060281547', '869247060310668',
        '869247060287429', '869247060280671', '869247060311583', '869247060284491', '869247060310981',
        '869247060318174', '869247060314959', '869247060280978', '869247060284624', '869247060278790',
        '869247060317515', '869247060287767', '869247060311062', '869247060285829', '869247060288047',
        '869247060314298'
    ];
    
    // Dividir em grupos de 10
    const smallBatches = [];
    for (let i = 0; i < userImeis.length; i += 10) {
        smallBatches.push(userImeis.slice(i, i + 10));
    }
    
    console.log('\n📦 Divisão sugerida para teste:');
    smallBatches.forEach((batch, index) => {
        console.log(`\nLote ${index + 1} (${batch.length} IMEIs):`);
        batch.forEach(imei => console.log(`   ${imei}`));
    });
    
    console.log('\n✅ TESTE CADA LOTE SEPARADAMENTE:');
    console.log('1. Cole o Lote 1 → Consultar → Quantos retornaram?');
    console.log('2. Cole o Lote 2 → Consultar → Quantos retornaram?');
    console.log('3. Cole o Lote 3 → Consultar → Quantos retornaram?');
    console.log('4. Cole o Lote 4 → Consultar → Quantos retornaram?');
    
    console.log('\n🎯 OBJETIVO:');
    console.log('Se cada lote pequeno retornar todos os resultados,');
    console.log('confirma que o problema é limite da API em lotes grandes.');
}

analyzeApiResponse();
