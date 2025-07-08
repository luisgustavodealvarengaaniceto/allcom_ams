// Login System - Allcom JC450
class LoginManager {
    constructor() {
        console.log('🏗️ LoginManager: Construtor iniciado');
        this.sessionKey = 'allcom_session';
        this.users = {};
        this.config = {};
        this.isInitialized = false;
        this.loginInProgress = false;
        this.init();
    }

    // Inicialização assíncrona
    async init() {
        console.log('🚀 LoginManager: Inicialização começando');
        try {
            console.log('📥 LoginManager: Carregando usuários...');
            this.users = await this.loadUsers();
            console.log('✅ LoginManager: Usuários carregados:', Object.keys(this.users));
            console.log('⚙️ LoginManager: Configurando event listeners...');
            this.initializeEventListeners();
            console.log('✅ LoginManager: Event listeners configurados');
            console.log('🔍 LoginManager: Verificando sessão existente...');
            
            this.checkExistingSession();
            console.log('✅ LoginManager: Sessão verificada');
            
            // Verificar e garantir que o loading overlay esteja escondido
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                console.log('🔍 LoginManager: Status inicial do loading overlay:', loadingOverlay.classList.contains('hidden') ? 'ESCONDIDO' : 'VISÍVEL');
                if (!loadingOverlay.classList.contains('hidden')) {
                    console.log('⚠️ LoginManager: Loading overlay estava visível, escondendo...');
                    loadingOverlay.classList.add('hidden');
                }
            } else {
                console.log('⚠️ LoginManager: Loading overlay não encontrado!');
            }
            
            // CRÍTICO: Marcar como inicializado SOMENTE aqui
            this.isInitialized = true;
            console.log('🎉 LoginManager: Inicialização completa - Sistema pronto!');
            console.log('✅ LoginManager: isInitialized =', this.isInitialized);
        } catch (error) {
            console.error('❌ LoginManager: Erro na inicialização:', error);
            console.log('🔄 LoginManager: Usando configuração padrão como fallback...');
            this.users = this.getDefaultUsers();
            this.config = this.getDefaultConfig();
            this.initializeEventListeners();
            this.isInitialized = true;
            console.log('✅ LoginManager: Fallback concluído, isInitialized =', this.isInitialized);
        }
    }

    // Carregar usuários do arquivo de configuração
    async loadUsers() {
        console.log('📁 loadUsers: Iniciando carregamento de usuários');
        try {
            console.log('🌐 loadUsers: Protocolo atual:', window.location.protocol);
            
            // Verificar se estamos em ambiente local (file://) ou servidor
            if (window.location.protocol === 'file:') {
                console.log('🏠 loadUsers: Ambiente local detectado, usando configuração embutida');
                this.config = this.getDefaultConfig();
                const defaultUsers = this.getDefaultUsers();
                console.log('✅ loadUsers: Configuração padrão carregada com', Object.keys(defaultUsers).length, 'usuários');
                return defaultUsers;
            }

            console.log('🌍 loadUsers: Ambiente servidor detectado, tentando carregar users.json');
            // Tentar carregar do arquivo users.json externo (apenas em servidor)
            const response = await fetch('./users.json');
            console.log('📥 loadUsers: Resposta do fetch:', response.status, response.statusText);
            
            if (response.ok) {
                console.log('✅ loadUsers: Arquivo users.json encontrado, fazendo parse');
                const userData = await response.json();
                this.config = userData.config || this.getDefaultConfig();
                console.log('✅ loadUsers: Configuração carregada do arquivo users.json');
                console.log('👥 loadUsers: Usuários carregados:', Object.keys(userData.users || {}));
                return userData.users || {};
            } else {
                console.log('❌ loadUsers: Falha na resposta do servidor:', response.status);
            }
        } catch (error) {
            console.warn('⚠️ loadUsers: Erro ao carregar users.json:', error.message);
            console.log('🔄 loadUsers: Fallback para configuração padrão');
        }

        // Fallback para usuários padrão se o arquivo não existir
        console.info('Usando configuração padrão de usuários');
        this.config = this.getDefaultConfig();
        return this.getDefaultUsers();
    }

    // Configuração padrão do sistema
    getDefaultConfig() {
        return {
            maxLoginAttempts: 5,
            lockoutDuration: 300,       // 5 minutos em segundos
            passwordMinLength: 6
        };
    }

    // Usuários padrão (backup)
    getDefaultUsers() {
        return {
            'admin': {
                password: 'AllC0m@dm1n2025!',
                name: 'Administrador',
                role: 'admin',
                permissions: ['read', 'write', 'admin'],
                lastLogin: null,
                email: 'admin@allcom.com',
                active: true
            },
            'tecnico': {
                password: 'T3cn1c0@2025!',
                name: 'Técnico Especialista',
                role: 'technician',
                permissions: ['read', 'write'],
                lastLogin: null,
                email: 'tecnico@allcom.com',
                active: true
            },
            'consultor': {
                password: 'C0nsult0r@2025!',
                name: 'Consultor de Vendas',
                role: 'viewer',
                permissions: ['read'],
                lastLogin: null,
                email: 'consultor@allcom.com',
                active: true
            },
            'gerente': {
                password: 'G3r3nt3@2025!',
                name: 'Gerente de Operações',
                role: 'manager',
                permissions: ['read', 'write', 'reports'],
                lastLogin: null,
                email: 'gerente@allcom.com',
                active: true
            }
        };
    }

    // Inicializar event listeners
    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Enter em qualquer campo submete o form
        [usernameInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleLogin(e);
                    }
                });
            }
        });
    }

    // Verificar se já existe uma sessão ativa
    checkExistingSession() {
        console.log('🔍 checkExistingSession: Verificando sessão existente...');
        const session = this.getSession();
        console.log('📋 checkExistingSession: Sessão encontrada:', !!session);
        
        if (session) {
            console.log('👤 checkExistingSession: Usuário da sessão:', session.user?.name);
            console.log('⏰ checkExistingSession: Login em:', session.loginTime);
            
            const isValid = this.isValidSession(session);
            console.log('✅ checkExistingSession: Sessão válida:', isValid);
            
            if (isValid) {
                console.log('↗️ checkExistingSession: Redirecionando para página principal');
                this.redirectToMain();
            } else {
                console.log('🗑️ checkExistingSession: Sessão inválida, limpando...');
                this.clearSession();
            }
        } else {
            console.log('📝 checkExistingSession: Nenhuma sessão encontrada');
        }
    }

    // Processar login
    async handleLogin(e) {
        console.log('🔑 handleLogin: Iniciando processo de login');
        console.log('🔍 handleLogin: this.isInitialized =', this.isInitialized);
        e.preventDefault();
        
        // Verificar se já há um login em progresso
        if (this.loginInProgress) {
            console.log('⚠️ handleLogin: Login já em progresso, ignorando');
            return;
        }
        
        // Verificar se o sistema está inicializado
        if (!this.isInitialized) {
            console.log('⚠️ handleLogin: Sistema não inicializado ainda');
            console.log('🔍 handleLogin: Aguardando inicialização...');
            this.showToast('Aviso', 'Sistema carregando, aguarde...', 'warning');
            return;
        }
        
        console.log('📝 handleLogin: Coletando dados do formulário');
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        console.log('👤 handleLogin: Username:', username);
        console.log('🔒 handleLogin: Password length:', password.length);
        console.log('💾 handleLogin: Remember me:', rememberMe);

        if (!username || !password) {
            console.log('❌ handleLogin: Campos vazios');
            this.showToast('Erro', 'Por favor, preencha todos os campos', 'error');
            return;
        }

        console.log('⏳ handleLogin: Iniciando loading...');
        this.loginInProgress = true;
        this.showLoading(true);

        // Simular delay de autenticação (reduzido para melhor UX)
        console.log('⏰ handleLogin: Simulando autenticação com delay...');
        setTimeout(() => {
            console.log('🔐 handleLogin: Executando autenticação...');
            const result = this.authenticateUser(username, password);
            console.log('📊 handleLogin: Resultado da autenticação:', result);
            
            if (result.success) {
                console.log('✅ handleLogin: Autenticação bem-sucedida');
                console.log('💾 handleLogin: Criando sessão...');
                this.createSession(result.user, rememberMe);
                console.log('🎉 handleLogin: Sessão criada, mostrando toast de sucesso');
                this.showToast('Sucesso', `Bem-vindo, ${result.user.name}!`, 'success');
                
                console.log('🔄 handleLogin: Preparando redirecionamento...');
                setTimeout(() => {
                    console.log('↗️ handleLogin: Redirecionando para página principal');
                    this.redirectToMain();
                }, 1500);
            } else {
                console.log('❌ handleLogin: Falha na autenticação:', result.message);
                this.showToast('Erro', result.message, 'error');
                console.log('🧹 handleLogin: Limpando formulário...');
                this.clearForm();
            }
            
            console.log('🔄 handleLogin: Finalizando loading...');
            this.showLoading(false);
            this.loginInProgress = false;
            console.log('✅ handleLogin: Processo de login finalizado');
        }, 800); // Reduzido de 1000ms para 800ms
    }

    // Autenticar usuário
    authenticateUser(username, password) {
        console.log('🔍 authenticateUser: Iniciando autenticação para:', username);
        console.log('👥 authenticateUser: Usuários disponíveis:', Object.keys(this.users));
        
        const user = this.users[username.toLowerCase()];
        console.log('👤 authenticateUser: Usuário encontrado:', !!user);
        
        if (!user) {
            console.log('❌ authenticateUser: Usuário não encontrado');
            return {
                success: false,
                message: 'Usuário não encontrado'
            };
        }

        console.log('✅ authenticateUser: Usuário existe, verificando se está ativo...');
        if (!user.active) {
            console.log('❌ authenticateUser: Usuário desativado');
            return {
                success: false,
                message: 'Usuário desativado. Entre em contato com o administrador.'
            };
        }

        console.log('🔒 authenticateUser: Verificando senha...');
        if (user.password !== password) {
            console.log('❌ authenticateUser: Senha incorreta');
            return {
                success: false,
                message: 'Senha incorreta'
            };
        }

        console.log('📏 authenticateUser: Verificando comprimento da senha...');
        // Verificar comprimento mínimo da senha (configurável)
        if (password.length < (this.config.passwordMinLength || 6)) {
            console.log('❌ authenticateUser: Senha muito curta');
            return {
                success: false,
                message: `Senha deve ter pelo menos ${this.config.passwordMinLength || 6} caracteres`
            };
        }

        console.log('📅 authenticateUser: Atualizando último login...');
        // Atualizar último login
        user.lastLogin = new Date().toISOString();

        console.log('✅ authenticateUser: Autenticação bem-sucedida!');
        return {
            success: true,
            user: {
                username: username.toLowerCase(),
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                email: user.email,
                lastLogin: user.lastLogin
            }
        };
    }

    // Criar sessão (sem expiração automática)
    createSession(user, rememberMe) {
        console.log('💾 createSession: Criando nova sessão...');
        console.log('👤 createSession: Usuário:', user.name);
        console.log('🔄 createSession: Lembrar de mim:', rememberMe);
        
        const now = Date.now();
        console.log('🕐 createSession: Agora:', new Date(now).toISOString());
        
        const session = {
            user: user,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
            lastAccess: new Date().toISOString()
        };

        console.log('📋 createSession: Sessão criada:', {
            user: session.user.name,
            loginTime: session.loginTime,
            rememberMe: session.rememberMe
        });

        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        console.log('✅ createSession: Sessão salva no localStorage');
        
        // Log de auditoria
        this.logAccess(user.username, 'login_success');
    }

    // Obter sessão atual
    getSession() {
        try {
            console.log('📥 getSession: Buscando sessão no localStorage...');
            const sessionData = localStorage.getItem(this.sessionKey);
            console.log('📋 getSession: Dados encontrados:', !!sessionData);
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                console.log('👤 getSession: Usuário:', parsed.user?.name);
                console.log('⏰ getSession: Login em:', parsed.loginTime);
                return parsed;
            }
            return null;
        } catch (error) {
            console.error('❌ getSession: Erro ao obter sessão:', error);
            return null;
        }
    }

    // Validar sessão com verificação de estrutura e opcionalmente expiração
    isValidSession(session) {
        console.log('✅ isValidSession: Iniciando validação...');
        
        try {
            // Verifica se a sessão tem os dados básicos necessários
            const isValid = session && 
                           session.user && 
                           session.user.username && 
                           session.loginTime;
            
            console.log('� isValidSession: Sessão válida:', isValid);
            if (isValid) {
                console.log('� isValidSession: Usuário:', session.user.username);
                console.log('⏰ isValidSession: Login em:', session.loginTime);
            }
            
            return isValid;
        } catch (error) {
            console.error('❌ isValidSession: Erro na validação da sessão:', error);
            return false;
        }
    }

    // Logout
    logout() {
        const session = this.getSession();
        if (session) {
            this.logAccess(session.user.username, 'logout');
        }
        
        localStorage.removeItem(this.sessionKey);
        window.location.href = 'login.html';
    }

    // Redirecionar para página principal
    redirectToMain() {
        console.log('↗️ redirectToMain: Iniciando redirecionamento...');
        console.log('📍 redirectToMain: URL atual:', window.location.href);
        
        // Verificar se a sessão foi realmente salva antes de redirecionar
        const savedSession = localStorage.getItem(this.sessionKey);
        console.log('� redirectToMain: Verificando sessão salva:', !!savedSession);
        if (savedSession) {
            const session = JSON.parse(savedSession);
            console.log('✅ redirectToMain: Sessão confirmada para usuário:', session.user.name);
            console.log('⏰ redirectToMain: Login em:', session.loginTime);
        } else {
            console.error('❌ redirectToMain: ERRO - Sessão não encontrada no localStorage!');
            this.showToast('Erro', 'Erro ao salvar sessão. Tente novamente.', 'error');
            return;
        }
        
        console.log('�📍 redirectToMain: Redirecionando para: index.html');
        
        // Delay maior para garantir que tudo foi salvo
        setTimeout(() => {
            console.log('🚀 redirectToMain: Executando redirecionamento agora');
            window.location.href = 'index.html';
        }, 300);
    }

    // Limpar formulário
    clearForm() {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('rememberMe').checked = false;
        document.getElementById('username').focus();
    }

    // Mostrar/ocultar loading
    showLoading(show) {
        console.log('🔄 showLoading: Chamado com show =', show);
        
        const overlay = document.getElementById('loadingOverlay');
        const loginBtn = document.getElementById('loginBtn');
        const btnContent = document.getElementById('btnContent');
        const btnLoading = document.getElementById('btnLoading');
        
        console.log('🔍 showLoading: Elementos encontrados:');
        console.log('  - overlay:', !!overlay);
        console.log('  - loginBtn:', !!loginBtn);
        console.log('  - btnContent:', !!btnContent);
        console.log('  - btnLoading:', !!btnLoading);
        
        if (show) {
            console.log('⏳ showLoading: Ativando loading...');
            // Mostrar overlay de loading
            if (overlay) {
                overlay.classList.remove('hidden');
                console.log('✅ showLoading: Overlay mostrado');
            } else {
                console.log('❌ showLoading: Overlay não encontrado');
            }
            
            // Desabilitar botão e trocar conteúdo
            if (loginBtn) {
                loginBtn.disabled = true;
                console.log('✅ showLoading: Botão desabilitado');
            }
            
            if (btnContent) {
                btnContent.classList.add('hidden');
                console.log('✅ showLoading: Conteúdo do botão ocultado');
            }
            
            if (btnLoading) {
                btnLoading.classList.remove('hidden');
                console.log('✅ showLoading: Loading do botão mostrado');
            }
            
            console.log('✅ showLoading: Loading ativado completamente');
        } else {
            console.log('🔚 showLoading: Desativando loading...');
            // Ocultar overlay de loading
            if (overlay) {
                overlay.classList.add('hidden');
                console.log('✅ showLoading: Overlay ocultado');
            }
            
            // Reabilitar botão e restaurar conteúdo
            if (loginBtn) {
                loginBtn.disabled = false;
                console.log('✅ showLoading: Botão reabilitado');
            }
            
            if (btnContent) {
                btnContent.classList.remove('hidden');
                console.log('✅ showLoading: Conteúdo do botão restaurado');
            }
            
            if (btnLoading) {
                btnLoading.classList.add('hidden');
                console.log('✅ showLoading: Loading do botão ocultado');
            }
            
            console.log('✅ showLoading: Loading desativado completamente');
        }
    }

    // Mostrar toast notification
    showToast(title, message, type = 'info') {
        const container = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove após 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    // Log de acesso (auditoria simples)
    logAccess(username, action) {
        const logEntry = {
            username: username,
            action: action,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: 'client-side' // Em produção, seria obtido do servidor
        };

        // Salvar no localStorage (em produção seria enviado para servidor)
        const logs = JSON.parse(localStorage.getItem('allcom_access_logs') || '[]');
        logs.push(logEntry);
        
        // Manter apenas os últimos 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('allcom_access_logs', JSON.stringify(logs));
    }

    // Verificar permissões do usuário atual
    static hasPermission(permission) {
        const loginManager = new LoginManager();
        const session = loginManager.getSession();
        
        if (!session || !loginManager.isValidSession(session)) {
            return false;
        }
        
        return session.user.permissions.includes(permission);
    }

    // Obter informações do usuário atual
    static getCurrentUser() {
        const loginManager = new LoginManager();
        const session = loginManager.getSession();
        
        if (!session || !loginManager.isValidSession(session)) {
            return null;
        }
        
        return session.user;
    }

    // Limpar sessão
    clearSession() {
        console.log('🗑️ clearSession: Removendo sessão do localStorage...');
        localStorage.removeItem(this.sessionKey);
        console.log('✅ clearSession: Sessão removida');
    }

    // Limpar sessões inválidas automaticamente
    cleanExpiredSessions() {
        console.log('🧹 cleanExpiredSessions: Verificando sessões inválidas...');
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (!this.isValidSession(session)) {
                    console.log('🗑️ cleanExpiredSessions: Removendo sessão inválida');
                    this.clearSession();
                } else {
                    console.log('✅ cleanExpiredSessions: Sessão ainda válida');
                }
            }
        } catch (error) {
            console.error('❌ cleanExpiredSessions: Erro:', error);
            this.clearSession();
        }
    }
}

// Funções utilitárias globais
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// Verificar se usuário está logado (para usar em outras páginas)
function requireLogin() {
    const loginManager = new LoginManager();
    const session = loginManager.getSession();
    
    if (!session || !loginManager.isValidSession(session)) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, iniciando LoginManager...');
    
    // Verificar elementos essenciais
    const loginCard = document.querySelector('.login-card');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loginForm = document.getElementById('loginForm');
    
    console.log('🔍 Verificação inicial dos elementos:');
    console.log('  - Login Card:', loginCard ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    console.log('  - Loading Overlay:', loadingOverlay ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    console.log('  - Login Form:', loginForm ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    
    if (loadingOverlay) {
        console.log('  - Loading Overlay status:', loadingOverlay.classList.contains('hidden') ? 'ESCONDIDO' : 'VISÍVEL');
        console.log('  - Loading Overlay classes:', loadingOverlay.className);
        console.log('  - Loading Overlay display:', window.getComputedStyle(loadingOverlay).display);
    }
    
    const loginManager = new LoginManager();
    
    // Focus no campo usuário
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        console.log('🎯 Focando no campo de usuário');
        usernameInput.focus();
    } else {
        console.log('❌ Campo de usuário não encontrado');
    }
    
    // Salvar referência global para debug
    window.loginManagerInstance = loginManager;
    console.log('✅ LoginManager inicializado e disponível globalmente');
});

// Exportar para uso em outros módulos
if (typeof window !== 'undefined') {
    window.LoginManager = LoginManager;
    window.requireLogin = requireLogin;
}
