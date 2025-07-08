// Auth Manager - Sistema de Autenticação para páginas principais
class AuthManager {
    constructor() {
        console.log('🔐 AuthManager: Construtor iniciado');
        this.sessionKey = 'allcom_session';
        this.init();
    }

    // Inicialização
    init() {
        console.log('🚀 AuthManager: Inicializando verificação de autenticação');
        
        // Pequeno delay para garantir que o localStorage está acessível
        setTimeout(() => {
            console.log('🔍 AuthManager: Executando verificação após delay...');
            this.checkAuthentication();
            this.setupEventListeners();
            this.displayUserInfo();
        }, 100);
    }

    // Verificar se o usuário está autenticado (sem expiração)
    checkAuthentication() {
        console.log('🔍 AuthManager: Verificando autenticação...');
        const session = this.getSession();
        console.log('📋 AuthManager: Sessão encontrada:', !!session);
        
        if (!session || !this.isValidSession(session)) {
            console.log('⚠️ AuthManager: Sessão não encontrada, tentando novamente em 500ms...');
            
            // Retry uma vez após delay (pode ser problema de timing)
            setTimeout(() => {
                console.log('🔄 AuthManager: Segunda tentativa de verificação...');
                const retrySession = this.getSession();
                console.log('📋 AuthManager: Sessão na segunda tentativa:', !!retrySession);
                
                if (!retrySession || !this.isValidSession(retrySession)) {
                    console.log('❌ AuthManager: Sessão inválida após retry, redirecionando para login');
                    this.redirectToLogin();
                    return false;
                } else {
                    console.log('✅ AuthManager: Usuário autenticado na segunda tentativa:', retrySession.user.name);
                    return true;
                }
            }, 500);
            
            return false;
        }
        
        console.log('✅ AuthManager: Usuário autenticado:', session.user.name);
        return true;
    }

    // Obter sessão do localStorage
    getSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            console.log('🔍 AuthManager: Dados da sessão no localStorage:', !!sessionData);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('❌ AuthManager: Erro ao recuperar sessão:', error);
            return null;
        }
    }

    // Validar se a sessão é válida (apenas verifica estrutura básica)
    isValidSession(session) {
        console.log('✅ AuthManager: Validando sessão...');
        
        // Apenas verifica se tem os dados básicos necessários
        const isValid = session && 
                       session.user && 
                       session.user.username && 
                       session.loginTime;
        
        console.log('📋 AuthManager: Sessão válida:', isValid);
        if (isValid) {
            console.log('👤 AuthManager: Usuário:', session.user.username);
        }
        
        return isValid;
    }

    // Redirecionar para página de login
    redirectToLogin() {
        console.log('🔄 AuthManager: Redirecionando para login...');
        // Limpar sessão inválida
        this.clearSession();
        
        // Mostrar toast de aviso (se disponível)
        if (typeof showToast === 'function') {
            console.log('🍞 AuthManager: Mostrando toast de aviso');
            showToast('Aviso', 'É necessário fazer login para acessar o sistema.', 'warning');
        } else {
            console.log('⚠️ AuthManager: Função showToast não disponível');
        }
        
        // Redirecionar após um breve delay
        console.log('⏳ AuthManager: Redirecionamento em 1.5s...');
        setTimeout(() => {
            console.log('↗️ AuthManager: Executando redirecionamento para login.html');
            window.location.href = './login.html';
        }, 1500);
    }

    // Exibir informações do usuário
    displayUserInfo() {
        const session = this.getSession();
        
        if (!session || !session.user) {
            return;
        }

        const userSection = document.getElementById('userSection');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');

        if (userSection && userName && userRole) {
            userName.textContent = session.user.name || session.user.username;
            userRole.textContent = this.getRoleDisplayName(session.user.role);
            userRole.className = `user-role role-${session.user.role}`;
            userSection.style.display = 'flex';
        }
    }

    // Obter nome amigável do perfil
    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'Administrador',
            'manager': 'Gerente',
            'technician': 'Técnico',
            'viewer': 'Consultor',
            'demo': 'Demo'
        };
        
        return roleNames[role] || role;
    }

    // Configurar event listeners
    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    // Fazer logout
    logout() {
        const session = this.getSession();
        
        // Log de auditoria
        if (session && session.user) {
            console.log(`Logout realizado: ${session.user.username} em ${new Date().toISOString()}`);
        }

        // Limpar sessão
        this.clearSession();

        // Mostrar mensagem e redirecionar
        if (typeof showToast === 'function') {
            showToast('Sucesso', 'Logout realizado com sucesso!', 'success');
        }
        
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1500);
    }

    // Limpar sessão
    clearSession() {
        localStorage.removeItem(this.sessionKey);
    }

    // Obter informações do usuário atual
    getCurrentUser() {
        const session = this.getSession();
        return session ? session.user : null;
    }

    // Verificar se o usuário tem uma permissão específica
    hasPermission(permission) {
        const user = this.getCurrentUser();
        
        if (!user || !user.permissions) {
            return false;
        }

        return user.permissions.includes(permission);
    }

    // Verificar se o usuário tem um perfil específico
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    // Atualizar último acesso (opcional, sem impacto na sessão)
    updateLastAccess() {
        const session = this.getSession();
        
        if (session) {
            session.lastAccess = new Date().toISOString();
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        }
    }
}

// Método de teste manual (disponível no console)
window.testSession = function() {
    console.log('🧪 === TESTE MANUAL DE SESSÃO ===');
    const sessionKey = 'allcom_session';
    const sessionData = localStorage.getItem(sessionKey);
    
    console.log('🔍 SessionKey:', sessionKey);
    console.log('📋 SessionData exists:', !!sessionData);
    
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            console.log('👤 User:', session.user?.name);
            console.log('⏰ Login Time:', session.loginTime);
            console.log('⏰ Last Access:', session.lastAccess);
            
            const isValid = session && 
                           session.user && 
                           session.user.username && 
                           session.loginTime;
            
            console.log('✅ Valid:', isValid);
        } catch (e) {
            console.error('❌ Parse error:', e);
        }
    }
    
    console.log('🏁 Teste concluído');
};

// Inicializar o gerenciador de autenticação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    
    // Atualizar último acesso a cada 30 segundos (opcional)
    setInterval(() => {
        if (window.authManager) {
            window.authManager.updateLastAccess();
        }
    }, 30000);
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
