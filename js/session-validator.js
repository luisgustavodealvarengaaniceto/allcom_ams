/**
 * Versão aprimorada de validação de sessão com melhor tratamento de erros
 * e capacidade de detecção de expiração para implementação futura
 */
class SessionValidator {
    /**
     * Valida uma sessão com verificações robustas
     * @param {Object} session - O objeto de sessão a ser validado
     * @param {boolean} checkExpiry - Se deve verificar expiração (quando disponível)
     * @returns {boolean} - Verdadeiro se a sessão for válida
     */
    static validateSession(session, checkExpiry = true) {
        try {
            // Verificação básica de estrutura
            if (!session || typeof session !== 'object') {
                console.log('⚠️ validateSession: Sessão inválida ou ausente');
                return false;
            }
            
            // Verificar dados obrigatórios
            if (!session.user || !session.user.username || !session.loginTime) {
                console.log('⚠️ validateSession: Dados básicos de sessão ausentes');
                return false;
            }
            
            // Verificar expiração se solicitado e disponível
            if (checkExpiry && session.expiry) {
                try {
                    const expiryDate = new Date(session.expiry);
                    const now = new Date();
                    
                    if (isNaN(expiryDate.getTime())) {
                        console.error('❌ validateSession: Data de expiração inválida:', session.expiry);
                        // Continuar sem verificar expiração
                    } 
                    else if (now > expiryDate) {
                        console.log('⌛ validateSession: Sessão expirada em', expiryDate.toLocaleString());
                        return false;
                    }
                } catch (e) {
                    console.error('❌ validateSession: Erro ao validar expiração:', e);
                    // Continuar com validação básica em caso de erro
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ validateSession: Erro na validação:', error);
            return false;
        }
    }
    
    /**
     * Calcula tempo restante de uma sessão
     * @param {Object} session - Sessão a analisar
     * @returns {Object} - Informações de tempo restante ou null se inválido
     */
    static getRemainingTime(session) {
        if (!session || !session.expiry) return null;
        
        try {
            const expiryDate = new Date(session.expiry);
            const now = new Date();
            
            if (isNaN(expiryDate.getTime())) return null;
            
            const diffMs = expiryDate - now;
            if (diffMs <= 0) return { expired: true, remainingMs: 0 };
            
            const remainingMinutes = Math.floor(diffMs / 60000);
            return {
                expired: false,
                remainingMs: diffMs,
                remainingMinutes: remainingMinutes
            };
        } catch (e) {
            return null;
        }
    }
}

// Para uso futuro na implementação de sessões com expiração
// Pode ser integrado no login.js quando necessário
