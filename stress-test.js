// Teste de stress com 1000 IMEIs
const fetch = require('node-fetch');

// Gerar IMEIs de teste
function generateTestIMEIs(count) {
    const baseIMEI = '869247060';
    const imeis = [];
    
    for (let i = 0; i < count; i++) {
        // Gerar 6 dígitos finais aleatórios
        const suffix = String(i).padStart(6, '0');
        imeis.push(baseIMEI + suffix);
    }
    
    return imeis;
}

// Criar lotes
function createBatches(imeis, batchSize) {
    const batches = [];
    for (let i = 0; i < imeis.length; i += batchSize) {
        batches.push(imeis.slice(i, i + batchSize));
    }
    return batches;
}

// Testar com proxy
async function testWithProxy(batchSize = 99, totalIMEIs = 1000) {
    console.log(`\n🔍 Teste de Stress: ${totalIMEIs} IMEIs em lotes de ${batchSize}`);
    
    const imeis = generateTestIMEIs(totalIMEIs);
    const batches = createBatches(imeis, batchSize);
    
    console.log(`📊 Total de lotes: ${batches.length}`);
    console.log(`⏱️ Tempo estimado: ${batches.length * 2}s (com delay de 2s entre lotes)`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchId = i + 1;
        
        try {
            console.log(`\n🔄 Lote ${batchId}/${batches.length} - ${batch.length} IMEIs`);
            
            const response = await fetch('http://localhost:3001/api/queryDeviceStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ imeiList: batch })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.code === 0) {
                    successCount++;
                    console.log(`✅ Lote ${batchId}: ${data.data.length} resultados`);
                } else {
                    errorCount++;
                    console.log(`❌ Lote ${batchId}: API Error - ${data.msg}`);
                    errors.push(`Lote ${batchId}: API Error - ${data.msg}`);
                }
            } else {
                errorCount++;
                const errorText = await response.text();
                console.log(`❌ Lote ${batchId}: HTTP ${response.status} - ${errorText}`);
                errors.push(`Lote ${batchId}: HTTP ${response.status} - ${errorText}`);
            }
            
        } catch (error) {
            errorCount++;
            console.log(`❌ Lote ${batchId}: ${error.message}`);
            errors.push(`Lote ${batchId}: ${error.message}`);
        }
        
        // Delay entre lotes para evitar sobrecarga
        if (i < batches.length - 1) {
            const delay = batches.length > 5 ? 2000 : 1000;
            console.log(`⏳ Aguardando ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    console.log(`\n📊 Resultado Final:`);
    console.log(`✅ Sucessos: ${successCount}/${batches.length}`);
    console.log(`❌ Erros: ${errorCount}/${batches.length}`);
    console.log(`📈 Taxa de sucesso: ${(successCount / batches.length * 100).toFixed(2)}%`);
    
    if (errors.length > 0) {
        console.log(`\n❌ Erros detalhados:`);
        errors.forEach(error => console.log(`  - ${error}`));
    }
}

// Executar teste
async function runStressTest() {
    console.log('🚀 Iniciando teste de stress...');
    
    // Verificar se o proxy está rodando
    try {
        const healthCheck = await fetch('http://localhost:3001/health');
        if (healthCheck.ok) {
            console.log('✅ Proxy servidor está rodando');
        } else {
            console.log('❌ Proxy servidor não está respondendo');
            return;
        }
    } catch (error) {
        console.log('❌ Proxy servidor não está disponível:', error.message);
        return;
    }
    
    // Teste com diferentes configurações
    await testWithProxy(99, 250);   // Cenário que funciona
    await testWithProxy(99, 1000);  // Cenário que falha
}

runStressTest().catch(console.error);
