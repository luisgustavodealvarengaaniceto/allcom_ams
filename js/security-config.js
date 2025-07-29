/**
 * security-config.js - Arquivo para configuração de segurança para produção Oracle
 * 
 * Incorpore este código no início do proxy-server.js ou importe como módulo
 * para aplicar configurações de segurança recomendadas
 */

const securityConfig = {
    // Configurações de CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'https://seu-dominio-oracle.com',
        methods: 'GET,POST,PUT,DELETE',
        allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
        credentials: true,
        maxAge: 86400 // 1 dia
    },
    
    // Cabeçalhos de segurança
    headers: {
        'X-Frame-Options': 'DENY', // Prevenir clickjacking
        'X-Content-Type-Options': 'nosniff', // Evitar MIME sniffing
        'X-XSS-Protection': '1; mode=block', // Proteção XSS para browsers antigos
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload', // HSTS (2 anos)
        'Content-Security-Policy': "default-src 'self'; " +
                                   "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
                                   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
                                   "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
                                   "img-src 'self' data:; " +
                                   "connect-src 'self' http://fota-api.jimicloud.com https://fota-api.jimicloud.com;",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' // Restringir permissões
    },
    
    // Configurações de cookies
    cookieSettings: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hora
        domain: process.env.COOKIE_DOMAIN || undefined
    }
};

// Função para aplicar as configurações
function applySecurityConfig(app) {
    // Aplicar cabeçalhos de segurança
    app.use((req, res, next) => {
        Object.entries(securityConfig.headers).forEach(([header, value]) => {
            res.setHeader(header, value);
        });
        next();
    });
    
    // Aplicar configurações de cookies nas sessões
    if (app.use && app.session) {
        app.use(app.session({
            secret: process.env.SESSION_SECRET || 'change-me-in-production',
            cookie: securityConfig.cookieSettings,
            resave: false,
            saveUninitialized: false
        }));
    }
    
    return app;
}

module.exports = { securityConfig, applySecurityConfig };
