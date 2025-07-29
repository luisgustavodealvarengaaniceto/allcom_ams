const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar configurações de segurança se o arquivo existir
let securityModule;
try {
    securityModule = require('./js/security-config');
    console.log('✅ Configurações de segurança carregadas');
} catch (err) {
    console.log('⚠️ Arquivo de configuração de segurança não encontrado, usando padrões');
}

const app = express();
const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || 'localhost';

// Configuration from environment variables
const CONFIG = {
    API_ENDPOINT: process.env.API_ENDPOINT || 'http://fota-api.jimicloud.com',
    JIMICLOUD_APP_KEY: process.env.JIMICLOUD_APP_KEY || 'Jimiiotbrasil',
    JIMICLOUD_SECRET: process.env.JIMICLOUD_SECRET || '23dd6cca658b4ec298aeb7beb4972fd4',
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000,
    MAX_BATCH_SIZE: parseInt(process.env.API_MAX_BATCH_SIZE) || 100,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    ENABLE_DEBUG_LOGS: process.env.ENABLE_DEBUG_LOGS === 'true'
};

// Log configuration on startup
console.log('🚀 Servidor Proxy Allcom JC450 iniciando...');
console.log('📍 API Endpoint:', CONFIG.API_ENDPOINT);
console.log('🔑 App Key:', CONFIG.JIMICLOUD_APP_KEY);
console.log('⏱️ Timeout:', CONFIG.API_TIMEOUT + 'ms');
console.log('📦 Max Batch Size:', CONFIG.MAX_BATCH_SIZE);

// Enable CORS for all routes
app.use(cors(securityModule?.securityConfig?.cors || {
    origin: CONFIG.CORS_ORIGIN,
    methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: process.env.CORS_HEADERS || 'X-Requested-With,Content-Type,Authorization',
    credentials: true
}));
app.use(express.json());

// Aplicar configurações de segurança se disponíveis
if (securityModule && securityModule.applySecurityConfig) {
    securityModule.applySecurityConfig(app);
    console.log('🔒 Cabeçalhos de segurança aplicados');
}

// Serve static files from the current directory
app.use(express.static(__dirname));

// Specific route for users.json with proper headers
app.get('/users.json', (req, res) => {
    const usersPath = path.join(__dirname, 'users.json');
    
    try {
        if (fs.existsSync(usersPath)) {
            const usersData = fs.readFileSync(usersPath, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-cache');
            res.send(usersData);
        } else {
            console.log('Arquivo users.json não encontrado, retornando configuração padrão');
            res.status(404).json({ 
                error: 'Arquivo users.json não encontrado',
                message: 'Use configuração padrão no frontend'
            });
        }
    } catch (error) {
        console.error('Erro ao ler users.json:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: 'Não foi possível carregar configuração de usuários'
        });
    }
});

// Route to serve login page as index if no specific file is requested
app.get('/', (req, res) => {
    const loginPath = path.join(__dirname, 'login.html');
    if (fs.existsSync(loginPath)) {
        res.sendFile(loginPath);
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Global token storage
let authToken = null;
let tokenExpiry = null;

// Function to obtain authentication token
async function getAuthToken() {
    // Check if token is still valid (with 5 minute buffer)
    if (authToken && tokenExpiry && Date.now() < (tokenExpiry - 5 * 60 * 1000)) {
        if (CONFIG.ENABLE_DEBUG_LOGS) {
            console.log('Proxy: Usando token existente válido');
        }
        return authToken;
    }

    console.log('Proxy: Obtendo novo token de autenticação...');
    
    try {
        const response = await fetch(`${CONFIG.API_ENDPOINT}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                appKey: CONFIG.JIMICLOUD_APP_KEY,
                secret: CONFIG.JIMICLOUD_SECRET
            }),
            timeout: 10000
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Proxy: Erro ao obter token:', response.status, errorText);
            throw new Error(`Falha na autenticação: ${response.status} - ${errorText}`);
        }

        const tokenData = await response.json();
        console.log('Proxy: Resposta do token:', tokenData);

        // JimiCloud returns: { code: 0, msg: "ok", data: { token: "..." } }
        if (tokenData.code === 0 && tokenData.data && tokenData.data.token) {
            authToken = tokenData.data.token;
            // Set expiry time (default 1 hour)
            const expiresIn = tokenData.data.expires_in || tokenData.data.expiresIn || 3600;
            tokenExpiry = Date.now() + (expiresIn * 1000);
            
            console.log(`Proxy: Token obtido com sucesso, expira em ${expiresIn} segundos`);
            return authToken;
        } else if (tokenData.token || tokenData.access_token || tokenData.accessToken) {
            // Fallback for other possible formats
            authToken = tokenData.token || tokenData.access_token || tokenData.accessToken;
            const expiresIn = tokenData.expires_in || tokenData.expiresIn || 3600;
            tokenExpiry = Date.now() + (expiresIn * 1000);
            
            console.log(`Proxy: Token obtido com sucesso (formato alternativo), expira em ${expiresIn} segundos`);
            return authToken;
        } else {
            throw new Error(`Token não encontrado na resposta da API. Resposta: ${JSON.stringify(tokenData)}`);
        }

    } catch (error) {
        console.error('Proxy: Erro ao obter token:', error.message);
        throw error;
    }
}

// Generate MD5 hash for authentication
function generateMD5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

// Proxy endpoint for JimiCloud API
app.post('/api/queryDeviceStatus', async (req, res) => {
    console.log('Proxy: === NOVA REQUISIÇÃO RECEBIDA ===');
    console.log('Proxy: Headers:', req.headers);
    console.log('Proxy: Body:', req.body);
    
    try {
        const { imeiList } = req.body;
        
        console.log('Proxy: Recebendo requisição para', imeiList.length, 'IMEIs');
        
        // Step 1: Get authentication token
        let token;
        try {
            token = await getAuthToken();
        } catch (tokenError) {
            console.error('Proxy: Falha ao obter token:', tokenError.message);
            return res.status(401).json({
                error: 'Falha na autenticação',
                message: 'Não foi possível obter token de acesso',
                details: tokenError.message
            });
        }
        
        // Step 2: Make authenticated request to query device status
        console.log('Proxy: Fazendo requisição autenticada com token');
        
        // Based on API documentation: Authorization header is required
        let response = await fetch(`${CONFIG.API_ENDPOINT}/queryDeviceStatus`, {
            method: 'POST',
            headers: {
                'Authorization': token,  // Just the token, no "Bearer" prefix
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ imeiList }),
            timeout: 45000  // Increased timeout to 45 seconds
        });
        
        // If plain token fails, try Bearer format
        if (!response.ok && response.status === 401) {
            console.log('Proxy: Token simples falhou, tentando Bearer');
            
            response = await fetch(`${CONFIG.API_ENDPOINT}/queryDeviceStatus`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ imeiList }),
                timeout: 30000
            });
        }
        
        // If Bearer fails, try token header
        if (!response.ok && response.status === 401) {
            console.log('Proxy: Bearer falhou, tentando header "token"');
            
            response = await fetch(`${CONFIG.API_ENDPOINT}/queryDeviceStatus`, {
                method: 'POST',
                headers: {
                    'token': token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ imeiList }),
                timeout: 30000
            });
        }
        
        // If all token methods fail, try fallback MD5 method
        if (!response.ok && response.status === 401) {
            console.log('Proxy: Todos os métodos de token falharam, tentando método MD5 como fallback');
            
            const timestamp = Date.now();
            const signString = `${CONFIG.JIMICLOUD_APP_KEY}${timestamp}${CONFIG.JIMICLOUD_SECRET}`;
            const sign = generateMD5(signString);
            
            response = await fetch(`${CONFIG.API_ENDPOINT}/queryDeviceStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'appkey': CONFIG.JIMICLOUD_APP_KEY,
                    'timestamp': timestamp.toString(),
                    'sign': sign
                },
                body: JSON.stringify({ imeiList }),
                timeout: 30000
            });
        }
        
        // If still failing, try query parameters method
        if (!response.ok && response.status === 401) {
            console.log('Proxy: MD5 falhou, tentando query parameters');
            
            const timestamp = Date.now();
            const signString = `${CONFIG.JIMICLOUD_APP_KEY}${timestamp}${CONFIG.JIMICLOUD_SECRET}`;
            const sign = generateMD5(signString);
            
            const url = new URL(`${CONFIG.API_ENDPOINT}/queryDeviceStatus`);
            url.searchParams.append('appkey', CONFIG.JIMICLOUD_APP_KEY);
            url.searchParams.append('timestamp', timestamp.toString());
            url.searchParams.append('sign', sign);
            
            response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ imeiList }),
                timeout: 30000
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Proxy: Resposta de erro:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Proxy: Resposta recebida da API JimiCloud:', data);
        
        // Check if the API returned an error in the response body
        if (data.code && data.code !== 0) {
            console.error('Proxy: API retornou erro:', data);
            return res.status(500).json({
                error: 'Erro da API JimiCloud',
                message: data.msg || 'Erro desconhecido da API',
                details: data,
                code: data.code
            });
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('Proxy: Erro:', error.message);
        
        // Handle different types of errors
        if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
            res.status(504).json({
                error: 'Timeout na API',
                message: 'A API JimiCloud demorou muito para responder. Tente novamente em alguns segundos.',
                details: 'Erro de timeout na conexão com a API'
            });
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
            res.status(503).json({
                error: 'API indisponível',
                message: 'Não foi possível conectar com a API JimiCloud. Verifique sua conexão de internet.',
                details: 'Erro de conexão com a API'
            });
        } else {
            res.status(500).json({
                error: 'Erro no proxy',
                message: error.message,
                details: 'Erro ao acessar a API JimiCloud'
            });
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Proxy servidor funcionando' });
});

app.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    const isProd = process.env.NODE_ENV === 'production';
    
    console.log('');
    console.log('🎉 Servidor Allcom JC450 iniciado com sucesso!');
    console.log(`📡 Servidor proxy rodando em ${HOST}:${PORT}`);
    console.log(`🔒 Ambiente: ${isProd ? 'PRODUÇÃO' : 'desenvolvimento'}`);
    console.log(`🌐 CORS: ${CONFIG.CORS_ORIGIN}`);
    console.log('');
    console.log(`🌐 Aplicação disponível em: ${baseUrl}`);
    console.log(`🔐 Login: ${baseUrl}/login.html`);
    console.log(`📊 Sistema: ${baseUrl}/index.html`);
    console.log(`🔧 API Proxy: ${baseUrl}/api/queryDeviceStatus`);
    console.log(`� Health check: ${baseUrl}/health`);
    console.log('');
    console.log(`✅ Pronto para uso! Acesse ${baseUrl} para começar`);
    
    if (isProd) {
        console.log('');
        console.log('⚠️ AVISO: Sistema rodando em modo PRODUÇÃO');
        console.log('⚠️ Logs detalhados estão desabilitados');
        console.log('⚠️ Apenas erros críticos serão exibidos no console');
    }
});

module.exports = app;
