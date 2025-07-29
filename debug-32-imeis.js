// Debug script para investigar problema dos 32 IMEIs retornando apenas 15
const fs = require('fs');

// Função para analisar os logs do console
function analyzeConsultationLogs() {
    console.log('=== ANÁLISE DE CONSULTA - 32 IMEIs RETORNANDO 15 ===\n');
    
    // Verificar possíveis causas
    const possibleCauses = [
        {
            cause: "IMEIs duplicados na lista",
            description: "Se houver IMEIs repetidos, apenas um será processado",
            solution: "Verificar se a lista tem duplicatas"
        },
        {
            cause: "IMEIs inválidos",
            description: "IMEIs com formato incorreto são filtrados antes do processamento",
            solution: "Validar formato dos IMEIs (15 dígitos numéricos)"
        },
        {
            cause: "Erro na API que retorna dados parciais",
            description: "A API pode estar retornando apenas parte dos dados solicitados",
            solution: "Verificar logs de resposta da API"
        },
        {
            cause: "Filtragem no parseApiResponse",
            description: "Dados podem estar sendo filtrados durante o parse",
            solution: "Verificar se todos os objetos retornados têm estrutura válida"
        },
        {
            cause: "Timeout ou erro de rede",
            description: "Requisição pode ter sido interrompida parcialmente",
            solution: "Verificar se houve mensagens de erro de timeout"
        },
        {
            cause: "Circuit breaker ativo",
            description: "Sistema pode ter interrompido processamento por excesso de erros",
            solution: "Verificar estado do circuit breaker"
        }
    ];
    
    console.log('POSSÍVEIS CAUSAS:\n');
    possibleCauses.forEach((item, index) => {
        console.log(`${index + 1}. ${item.cause}`);
        console.log(`   Descrição: ${item.description}`);
        console.log(`   Solução: ${item.solution}\n`);
    });
    
    // Instruções para debug
    console.log('=== INSTRUÇÕES PARA DEBUG ===\n');
    
    const debugSteps = [
        "1. Abra o console do navegador (F12 → Console)",
        "2. Antes de fazer nova consulta, execute:",
        "   console.clear(); // Limpar console",
        "   window.debugMode = true; // Ativar debug detalhado",
        "",
        "3. Faça a consulta dos 32 IMEIs novamente",
        "",
        "4. Procure no console por:",
        "   - Mensagens como '[batchId] Consultando X IMEIs'",
        "   - Mensagens como '[batchId] Sucesso: X resultados retornados'",
        "   - Mensagens de erro ou timeout",
        "   - Estado do circuit breaker",
        "",
        "5. Verifique se:",
        "   - Todos os 32 IMEIs foram enviados à API",
        "   - A API retornou dados para todos",
        "   - Não houve filtragem durante o processamento",
        "",
        "6. Execute no console para verificar dados:",
        "   console.log('Total processado:', deviceResults?.length);",
        "   console.log('IMEIs únicos:', new Set(deviceResults?.map(d => d.imei)).size);",
        "   console.log('Duplicatas encontradas:', deviceResults?.length - new Set(deviceResults?.map(d => d.imei)).size);"
    ];
    
    debugSteps.forEach(step => console.log(step));
    
    console.log('\n=== VERIFICAÇÕES ADICIONAIS ===\n');
    
    const additionalChecks = [
        "• Verificar se a lista original de IMEIs tem 32 itens únicos",
        "• Conferir se todos os IMEIs têm 15 dígitos",
        "• Verificar se não há caracteres especiais ou espaços",
        "• Confirmar se o servidor proxy está funcionando corretamente",
        "• Verificar se não há limitação da API JimiCloud"
    ];
    
    additionalChecks.forEach(check => console.log(check));
    
    console.log('\n=== PRÓXIMOS PASSOS ===');
    console.log('1. Execute o debug conforme instruções acima');
    console.log('2. Cole aqui os logs relevantes do console');
    console.log('3. Informe quantos IMEIs únicos você realmente inseriu');
    console.log('4. Confirme se algum IMEI foi rejeitado por formato inválido\n');
}

// Função para verificar formato de IMEIs
function validateIMEIs(imeiList) {
    console.log('=== VALIDAÇÃO DE IMEIS ===\n');
    
    const validIMEIs = [];
    const invalidIMEIs = [];
    const duplicates = [];
    const seen = new Set();
    
    imeiList.forEach((imei, index) => {
        const cleanImei = String(imei).trim();
        
        // Verificar duplicatas
        if (seen.has(cleanImei)) {
            duplicates.push(cleanImei);
            return;
        }
        seen.add(cleanImei);
        
        // Verificar formato (15 dígitos)
        if (/^\d{15}$/.test(cleanImei)) {
            validIMEIs.push(cleanImei);
        } else {
            invalidIMEIs.push({
                imei: cleanImei,
                position: index + 1,
                issue: getIMEIIssue(cleanImei)
            });
        }
    });
    
    console.log(`Total de IMEIs fornecidos: ${imeiList.length}`);
    console.log(`IMEIs válidos: ${validIMEIs.length}`);
    console.log(`IMEIs inválidos: ${invalidIMEIs.length}`);
    console.log(`IMEIs duplicados: ${duplicates.length}`);
    console.log(`IMEIs únicos válidos: ${validIMEIs.length}\n`);
    
    if (invalidIMEIs.length > 0) {
        console.log('IMEIS INVÁLIDOS:');
        invalidIMEIs.forEach(item => {
            console.log(`- Posição ${item.position}: "${item.imei}" (${item.issue})`);
        });
        console.log('');
    }
    
    if (duplicates.length > 0) {
        console.log('IMEIS DUPLICADOS:');
        duplicates.forEach(imei => console.log(`- ${imei}`));
        console.log('');
    }
    
    return {
        valid: validIMEIs,
        invalid: invalidIMEIs,
        duplicates: duplicates,
        total: imeiList.length,
        uniqueValid: validIMEIs.length
    };
}

function getIMEIIssue(imei) {
    if (!imei || imei.length === 0) return 'IMEI vazio';
    if (!/^\d+$/.test(imei)) return 'Contém caracteres não numéricos';
    if (imei.length < 15) return `Muito curto (${imei.length} dígitos)`;
    if (imei.length > 15) return `Muito longo (${imei.length} dígitos)`;
    return 'Formato desconhecido';
}

// Simular uma lista de 32 IMEIs para teste
function testWith32IMEIs() {
    console.log('=== TESTE COM 32 IMEIS SIMULADOS ===\n');
    
    // Gerar 32 IMEIs válidos para teste
    const testIMEIs = [];
    for (let i = 1; i <= 32; i++) {
        const imei = `86450000000000${i.toString().padStart(2, '0')}`;
        testIMEIs.push(imei);
    }
    
    console.log('Lista de 32 IMEIs de teste gerada:');
    console.log(testIMEIs.slice(0, 5).join(', ') + ' ... ' + testIMEIs.slice(-2).join(', '));
    console.log('\nExecutando validação...\n');
    
    const validation = validateIMEIs(testIMEIs);
    
    if (validation.uniqueValid === 32) {
        console.log('✅ Teste passou: 32 IMEIs únicos e válidos');
        console.log('O problema NÃO é formato de IMEI.\n');
    } else {
        console.log('❌ Problema encontrado na validação');
    }
    
    return testIMEIs;
}

// Executar análise
console.log('Iniciando análise do problema de consulta...\n');
analyzeConsultationLogs();

console.log('\n' + '='.repeat(60) + '\n');

testWith32IMEIs();

console.log('\n' + '='.repeat(60));
console.log('Para resolver o problema, preciso de mais informações:');
console.log('1. Execute o debug no navegador conforme instruções acima');
console.log('2. Cole os logs do console aqui');
console.log('3. Informe se os 32 IMEIs são realmente únicos e válidos');
console.log('4. Confirme qual tipo de erro (se houver) aparece no navegador');
