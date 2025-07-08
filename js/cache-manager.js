// Cache Manager para melhorar performance
class CacheManager {
    constructor() {
        this.prefix = 'allcom_jc450_';
    }

    // Cache de token
    storeToken(token, expiryTime) {
        const tokenData = {
            token: token,
            expiry: expiryTime,
            timestamp: Date.now()
        };
        localStorage.setItem(this.prefix + 'auth_token', JSON.stringify(tokenData));
    }

    getToken() {
        const stored = localStorage.getItem(this.prefix + 'auth_token');
        if (!stored) return null;

        const tokenData = JSON.parse(stored);
        
        // Check if token is still valid (with 5 minute buffer)
        if (Date.now() >= (tokenData.expiry - 5 * 60 * 1000)) {
            this.clearToken();
            return null;
        }

        return tokenData.token;
    }

    clearToken() {
        localStorage.removeItem(this.prefix + 'auth_token');
    }

    // Cache de resultados de consulta
    storeQueryResults(imeiList, results) {
        const cacheKey = this.prefix + 'query_' + this.hashImeiList(imeiList);
        const cacheData = {
            results: results,
            timestamp: Date.now(),
            imeiList: imeiList
        };
        
        // Cache por 5 minutos
        const expiryTime = Date.now() + (5 * 60 * 1000);
        cacheData.expiry = expiryTime;
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    getQueryResults(imeiList) {
        const cacheKey = this.prefix + 'query_' + this.hashImeiList(imeiList);
        const stored = localStorage.getItem(cacheKey);
        
        if (!stored) return null;

        const cacheData = JSON.parse(stored);
        
        // Check if cache is still valid
        if (Date.now() >= cacheData.expiry) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        return cacheData.results;
    }

    // Hash simples para criar chave de cache
    hashImeiList(imeiList) {
        return btoa(imeiList.sort().join(',')).replace(/[^a-zA-Z0-9]/g, '').substr(0, 20);
    }

    // Limpar cache antigo
    cleanup() {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.expiry && now >= data.expiry) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Remove invalid cache entries
                    localStorage.removeItem(key);
                }
            }
        });
    }

    // Configurações do usuário
    storeUserSettings(settings) {
        localStorage.setItem(this.prefix + 'user_settings', JSON.stringify(settings));
    }

    getUserSettings() {
        const stored = localStorage.getItem(this.prefix + 'user_settings');
        if (!stored) return {};
        return JSON.parse(stored);
    }

    // Funções para compatibilidade com app.js
    setAuthToken(token, expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        this.storeToken(token, expiryTime);
    }

    getAuthToken() {
        return this.getToken();
    }

    setQueryResult(key, results) {
        const cacheData = {
            results: results,
            timestamp: Date.now(),
            expiry: Date.now() + (5 * 60 * 1000) // 5 minutes
        };
        localStorage.setItem(this.prefix + key, JSON.stringify(cacheData));
    }

    getQueryResult(key) {
        const stored = localStorage.getItem(this.prefix + key);
        if (!stored) return null;

        const cacheData = JSON.parse(stored);
        if (Date.now() >= cacheData.expiry) {
            localStorage.removeItem(this.prefix + key);
            return null;
        }

        return cacheData.results;
    }

    setUserPreferences(preferences) {
        localStorage.setItem(this.prefix + 'user_preferences', JSON.stringify({
            ...preferences,
            timestamp: Date.now()
        }));
    }

    getUserPreferences() {
        const stored = localStorage.getItem(this.prefix + 'user_preferences');
        if (!stored) return {};
        
        try {
            return JSON.parse(stored);
        } catch (e) {
            return {};
        }
    }

    // Limpar todos os dados
    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}

// Instância global
const cacheManager = new CacheManager();

// Limpar cache antigo ao carregar
cacheManager.cleanup();

// Export for use in main app
if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
    // Also create a global instance for backward compatibility
    if (!window.cacheManager) {
        window.cacheManager = new CacheManager();
        console.log('✅ Global CacheManager instance created');
    }
}
