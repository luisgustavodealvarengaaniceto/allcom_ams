// 🧪 Debug de Sessão - Usar no console do navegador

// Função para testar sessão completa
window.debugSession = function() {
    console.log('🔍 === DEBUG DE SESSÃO ===');
    
    const sessionKey = 'allcom_session';
    console.log('🔑 Chave da sessão:', sessionKey);
    
    // Verificar se existe
    const sessionData = localStorage.getItem(sessionKey);
    console.log('📋 Dados brutos:', sessionData);
    
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            console.log('👤 Usuário:', session.user?.name);
            console.log('🆔 Username:', session.user?.username);
            console.log('🔄 Login em:', session.loginTime);
            console.log('💾 Lembrar:', session.rememberMe);
            console.log('⏰ Último acesso:', session.lastAccess);
            
            // Testar validação
            const isValid = session && 
                           session.user && 
                           session.user.username && 
                           session.loginTime;
            
            console.log('✅ Sessão válida:', isValid);
            
            return session;
        } catch (e) {
            console.error('❌ Erro ao parsear sessão:', e);
            return null;
        }
    } else {
        console.log('❌ Nenhuma sessão encontrada');
        return null;
    }
};

// Função para simular criação de sessão
window.createTestSession = function() {
    console.log('🛠️ Criando sessão de teste...');
    
    const testSession = {
        user: {
            username: 'test',
            name: 'Usuário Teste',
            role: 'admin',
            permissions: ['read', 'write', 'admin'],
            email: 'test@test.com'
        },
        loginTime: new Date().toISOString(),
        rememberMe: true,
        lastAccess: new Date().toISOString()
    };
    
    localStorage.setItem('allcom_session', JSON.stringify(testSession));
    console.log('✅ Sessão de teste criada');
    console.log('🔄 Execute debugSession() para verificar');
    
    return testSession;
};

// Função para limpar sessão
window.clearTestSession = function() {
    localStorage.removeItem('allcom_session');
    console.log('🗑️ Sessão removida');
};

// Função para ver todos os itens do localStorage
window.listLocalStorage = function() {
    console.log('📦 === TODOS OS ITENS DO LOCALSTORAGE ===');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${i + 1}. "${key}": ${value.length > 100 ? value.substring(0, 100) + '...' : value}`);
    }
    console.log(`📊 Total: ${localStorage.length} itens`);
};

console.log('🧪 Debug de sessão carregado!');
console.log('💡 Comandos disponíveis:');
console.log('   - debugSession()     : Verificar sessão atual');
console.log('   - createTestSession(): Criar sessão de teste');
console.log('   - clearTestSession() : Limpar sessão');
console.log('   - listLocalStorage() : Listar todos os dados');
