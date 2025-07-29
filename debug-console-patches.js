// Script para adicionar logging detalhado e debug da API
console.log('🔧 Aplicando patches de debug para investigação');

// Função para aplicar patches de debug no console do navegador
function applyDebugPatches() {
    console.log('\n📋 INSTRUÇÕES PARA DEBUG:');
    console.log('1. Copie e cole este código no Console do navegador (F12)');
    console.log('2. Faça a consulta dos 31 IMEIs');
    console.log('3. Observe os logs detalhados');
    
    console.log('\n🔧 CÓDIGO PARA COLAR NO CONSOLE:');
    console.log('');
    console.log('// ====== INÍCIO DO CÓDIGO DE DEBUG ======');
    console.log('');
    console.log('// Backup das funções originais');
    console.log('window._originalQueryDeviceStatus = window.queryDeviceStatus;');
    console.log('window._originalParseApiResponse = window.parseApiResponse;');
    console.log('');
    console.log('// Sobrescrever queryDeviceStatus com logging');
    console.log('window.queryDeviceStatus = async function(imeiList, retries = 2) {');
    console.log('    const batchId = Math.random().toString(36).substr(2, 9);');
    console.log('    console.log(`🔍 [${batchId}] DEBUG: Iniciando consulta com ${imeiList.length} IMEIs`);');
    console.log('    console.log(`📝 [${batchId}] IMEIs enviados:`, imeiList);');
    console.log('    ');
    console.log('    try {');
    console.log('        const result = await window._originalQueryDeviceStatus(imeiList, retries);');
    console.log('        console.log(`✅ [${batchId}] Consulta finalizada com sucesso`);');
    console.log('        console.log(`📊 [${batchId}] Resultados recebidos: ${result.length} de ${imeiList.length} esperados`);');
    console.log('        console.log(`📋 [${batchId}] IMEIs que retornaram dados:`, result.map(r => r.imei));');
    console.log('        ');
    console.log('        // Identificar IMEIs que não retornaram');
    console.log('        const returnedImeis = result.map(r => r.imei);');
    console.log('        const missingImeis = imeiList.filter(imei => !returnedImeis.includes(imei));');
    console.log('        if (missingImeis.length > 0) {');
    console.log('            console.warn(`⚠️ [${batchId}] IMEIs que NÃO retornaram dados (${missingImeis.length}):`, missingImeis);');
    console.log('        }');
    console.log('        ');
    console.log('        return result;');
    console.log('    } catch (error) {');
    console.log('        console.error(`❌ [${batchId}] Erro na consulta:`, error);');
    console.log('        throw error;');
    console.log('    }');
    console.log('};');
    console.log('');
    console.log('// Sobrescrever parseApiResponse com logging');
    console.log('window.parseApiResponse = function(data, batchId) {');
    console.log('    console.log(`🔍 [${batchId}] DEBUG: Parseando resposta da API`);');
    console.log('    console.log(`📥 [${batchId}] Dados recebidos:`, data);');
    console.log('    console.log(`📊 [${batchId}] Tipo dos dados:`, typeof data);');
    console.log('    console.log(`📋 [${batchId}] É array?`, Array.isArray(data));');
    console.log('    ');
    console.log('    if (Array.isArray(data)) {');
    console.log('        console.log(`✅ [${batchId}] Dados já são array com ${data.length} itens`);');
    console.log('    } else if (data && Array.isArray(data.data)) {');
    console.log('        console.log(`✅ [${batchId}] Dados encontrados em data.data com ${data.data.length} itens`);');
    console.log('    } else if (data && data.result && Array.isArray(data.result)) {');
    console.log('        console.log(`✅ [${batchId}] Dados encontrados em data.result com ${data.result.length} itens`);');
    console.log('    } else if (data && data.devices && Array.isArray(data.devices)) {');
    console.log('        console.log(`✅ [${batchId}] Dados encontrados em data.devices com ${data.devices.length} itens`);');
    console.log('    } else {');
    console.log('        console.warn(`⚠️ [${batchId}] Estrutura de dados não reconhecida:`, Object.keys(data || {}));');
    console.log('    }');
    console.log('    ');
    console.log('    const result = window._originalParseApiResponse(data, batchId);');
    console.log('    console.log(`📤 [${batchId}] Resultado final do parse: ${result.length} itens`);');
    console.log('    return result;');
    console.log('};');
    console.log('');
    console.log('console.log("🔧 Debug patches aplicados! Agora faça a consulta dos IMEIs.");');
    console.log('');
    console.log('// ====== FIM DO CÓDIGO DE DEBUG ======');
    
    console.log('\n💡 DEPOIS DE COLAR O CÓDIGO:');
    console.log('1. Você verá a mensagem "Debug patches aplicados!"');
    console.log('2. Cole os 31 IMEIs na caixa de texto');
    console.log('3. Clique em "Consultar"');
    console.log('4. Observe os logs detalhados no console');
    console.log('5. Anote quantos resultados foram retornados vs quantos eram esperados');
    
    console.log('\n🎯 O QUE PROCURAR NOS LOGS:');
    console.log('- "IMEIs enviados": Confirma que todos os 31 foram enviados');
    console.log('- "Dados recebidos": Mostra a resposta bruta da API');
    console.log('- "Resultados recebidos": Quantos efetivamente retornaram');
    console.log('- "IMEIs que NÃO retornaram dados": Lista dos que faltaram');
    
    console.log('\n📋 TESTE ADICIONAL:');
    console.log('Se confirmarmos que a API só retorna 15 registros,');
    console.log('podemos implementar uma solução automática para');
    console.log('dividir automaticamente em lotes menores.');
}

applyDebugPatches();
