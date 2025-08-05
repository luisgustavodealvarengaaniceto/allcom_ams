// Prevent multiple initialization
if (window.allcomAppInitialized) {
    // Evitar duplicação de inicialização
} else {
    window.allcomAppInitialized = true;

// API Configuration
const API_CONFIG = {
    endpoint: 'http://fota-api.jimicloud.com', // HTTPS para produção
    proxyEndpoint: '/api',
    appKey: 'Jimiiotbrasil',
    secret: '23dd6cca658b4ec298aeb7beb4972fd4',
    maxBatchSize: 99
};

// Server-side logging function
async function serverLog(level, message, data = null) {
    try {
        await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                level,
                message,
                data,
                timestamp: new Date().toISOString(),
                url: window.location.href
            })
        });
    } catch (error) {
        // Silently fail to avoid console pollution
    }
}

// Global state
let deviceResults = [];
let filteredResults = [];

// Initialize managers
let cacheManager, performanceManager, dashboardManager, exportManager, firmwareManager;

// DOM Elements
const imeiInput = document.getElementById('imeiInput');
const consultarBtn = document.getElementById('consultarBtn');
const limparBtn = document.getElementById('limparBtn');
const loadFileBtn = document.getElementById('loadFileBtn');
const fileInput = document.getElementById('fileInput');
const imeiCount = document.querySelector('.imei-count');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const dashboardSection = document.getElementById('dashboardSection');
const resultsList = document.getElementById('resultsList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const loadingText = document.getElementById('loadingText');
const totalResults = document.getElementById('totalResults');
const onlineResults = document.getElementById('onlineResults');
const offlineResults = document.getElementById('offlineResults');
const statusFilter = document.getElementById('statusFilter');
const searchFilter = document.getElementById('searchFilter');
const deviceModal = document.getElementById('deviceModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const toastContainer = document.getElementById('toastContainer');

// Dashboard elements
const toggleDashboard = document.getElementById('toggleDashboard');
const dashboardContent = document.getElementById('dashboardContent');
const exportCsv = document.getElementById('exportCsv');
const exportExcel = document.getElementById('exportExcel');
const exportJson = document.getElementById('exportJson');

// Firmware elements
const firmwareSelect = document.getElementById('firmwareSelect');
const customFirmwareInput = document.getElementById('customFirmwareInput');
const newFirmwareVersion = document.getElementById('newFirmwareVersion');
const addFirmwareBtn = document.getElementById('addFirmwareBtn');
const cancelFirmwareBtn = document.getElementById('cancelFirmwareBtn');
const refreshFirmwareBtn = document.getElementById('refreshFirmwareBtn');
const currentFirmwareDisplay = document.getElementById('currentFirmwareDisplay');
const selectedFirmwareText = document.getElementById('selectedFirmwareText');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    serverLog('info', 'DOM carregado, inicializando app', {
        location: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        port: window.location.port
    });
    
    // Check initial modal state
    const initialModal = document.getElementById('deviceModal');
    
    initializeManagers();
    setupEventListeners();
    updateImeiCount();
});

// Initialize all managers
function initializeManagers() {
    try {
        // Check if all required classes are available
        if (typeof CacheManager === 'undefined') {
            setTimeout(initializeManagers, 100);
            return;
        }
        
        if (typeof PerformanceManager === 'undefined' ||
            typeof DashboardManager === 'undefined' ||
            typeof ExportManager === 'undefined' ||
            typeof FirmwareManager === 'undefined') {
            setTimeout(initializeManagers, 100);
            return;
        }
        
        // Avoid re-initialization if already done
        if (window.cacheManager && cacheManager) {
            return;
        }
        
        // Initialize managers in correct order
        window.cacheManager = cacheManager = new CacheManager();
        window.performanceManager = performanceManager = new PerformanceManager();
        window.dashboardManager = dashboardManager = new DashboardManager();
        window.exportManager = exportManager = new ExportManager();
        window.firmwareManager = firmwareManager = new FirmwareManager();
        
        serverLog('info', 'Todos os managers inicializados com sucesso');
        
        // Wait a tick for managers to be fully ready
        setTimeout(() => {
            try {
                // Load user preferences
                loadUserPreferences();
                setupPreferencesAutoSave();
                
                // Initialize firmware interface
                initializeFirmwareInterface();
                
                // Ensure modal is hidden on startup
                const modal = document.getElementById('deviceModal');
                if (modal && !modal.classList.contains('hidden')) {
                    modal.classList.add('hidden');
                }
                
                serverLog('info', 'Sistema completamente inicializado');
            } catch (error) {
                serverLog('error', 'Erro na inicialização final', { error: error.message });
            }
        }, 50);
        
    } catch (error) {
        serverLog('error', 'Erro ao inicializar managers', { error: error.message });
        try {
            showToast('Erro ao inicializar sistema', 'error');
        } catch (toastError) {
            alert('Erro ao inicializar sistema. Recarregue a página.');
        }
    }
}

// Event listeners
function setupEventListeners() {
    imeiInput.addEventListener('input', handleImeiInput);
    consultarBtn.addEventListener('click', handleConsultar);
    limparBtn.addEventListener('click', handleLimpar);
    loadFileBtn.addEventListener('click', handleLoadFile);
    fileInput.addEventListener('change', handleFileSelect);
    statusFilter.addEventListener('change', handleStatusFilter);
    searchFilter.addEventListener('input', handleSearchFilter);
    closeModal.addEventListener('click', hideModal);
    
    // Dashboard listeners
    toggleDashboard.addEventListener('click', handleToggleDashboard);
    
    // Export listeners
    exportCsv.addEventListener('click', () => handleExport('csv'));
    exportExcel.addEventListener('click', () => handleExport('excel'));
    exportJson.addEventListener('click', () => handleExport('json'));
    
    // Firmware listeners
    firmwareSelect.addEventListener('change', handleFirmwareSelect);
    addFirmwareBtn.addEventListener('click', handleAddFirmware);
    cancelFirmwareBtn.addEventListener('click', handleCancelFirmware);
    refreshFirmwareBtn.addEventListener('click', handleRefreshFirmware);
    newFirmwareVersion.addEventListener('input', handleFirmwareInput);
    newFirmwareVersion.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddFirmware();
        if (e.key === 'Escape') handleCancelFirmware();
    });
    
    deviceModal.addEventListener('click', (e) => {
        if (e.target === deviceModal) hideModal();
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !deviceModal.classList.contains('hidden')) {
            hideModal();
        }
    });
    
    // Adicionar suporte para tecla ESC nos modais
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Fechar modal de firmware se estiver aberto
            const firmwareModal = document.getElementById('firmwareModal');
            if (firmwareModal) {
                closeFirmwareModal();
            }
            
            // Fechar modal de detalhes do dispositivo se estiver aberto
            const deviceModal = document.getElementById('deviceModal');
            if (deviceModal && deviceModal.style.display !== 'none') {
                hideModal();
            }
        }
    });
}

// IMEI input handler
function handleImeiInput() {
    updateImeiCount();
    const imeis = getValidImeis();
    consultarBtn.disabled = imeis.length === 0;
}

// Get valid IMEIs from input
function getValidImeis() {
    const text = imeiInput.value.trim();
    if (!text) return [];
    
    const lines = text.split('\n');
    const imeis = [];
    
    lines.forEach(line => {
        const imei = line.trim();
        if (isValidImei(imei)) {
            imeis.push(imei);
        }
    });
    
    return [...new Set(imeis)]; // Remove duplicates
}

// IMEI validation
function isValidImei(imei) {
    // Basic IMEI validation: 15 digits
    return /^\d{15}$/.test(imei);
}

// Update IMEI count display
function updateImeiCount() {
    const imeis = getValidImeis();
    const batchCount = Math.ceil(imeis.length / API_CONFIG.maxBatchSize);
    
    if (imeis.length === 0) {
        imeiCount.textContent = '0 IMEIs inseridos';
        imeiCount.style.color = '#4a5568';
    } else if (imeis.length <= API_CONFIG.maxBatchSize) {
        imeiCount.textContent = `${imeis.length} IMEIs inseridos`;
        imeiCount.style.color = '#4a5568';
    } else {
        imeiCount.innerHTML = `
            ${imeis.length} IMEIs inseridos 
            <small style="display: block; margin-top: 0.25rem; color: #667eea; font-weight: 500;">
                Processamento automático em lotes
            </small>
        `;
        imeiCount.style.color = '#4a5568';
    }
}

// Clear input handler
function handleLimpar() {
    imeiInput.value = '';
    updateImeiCount();
    consultarBtn.disabled = true;
    hideResults();
}

// File loading handlers
function handleLoadFile() {
    fileInput.click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.csv')) {
        showToast('Erro', 'Por favor, selecione um arquivo .txt ou .csv', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        loadImeisFromText(content, file.name);
    };
    reader.onerror = function() {
        showToast('Erro', 'Erro ao ler o arquivo', 'error');
    };
    reader.readAsText(file);
}

function loadImeisFromText(content, fileName) {
    const lines = content.split('\n');
    const imeis = [];
    let validCount = 0;
    let invalidCount = 0;
    
    lines.forEach((line, index) => {
        const cleanLine = line.trim().replace(/[^\d]/g, ''); // Remove non-digits
        
        if (cleanLine) {
            if (isValidImei(cleanLine)) {
                imeis.push(cleanLine);
                validCount++;
            } else {
                invalidCount++;
            }
        }
    });
    
    // Remove duplicates
    const uniqueImeis = [...new Set(imeis)];
    const duplicatesRemoved = imeis.length - uniqueImeis.length;
    
    // Add to existing content or replace
    const currentContent = imeiInput.value.trim();
    const newContent = currentContent 
        ? currentContent + '\n' + uniqueImeis.join('\n')
        : uniqueImeis.join('\n');
    
    imeiInput.value = newContent;
    updateImeiCount();
    
    // Show summary
    let message = `Arquivo "${fileName}" carregado: ${validCount} IMEIs válidos`;
    if (invalidCount > 0) message += `, ${invalidCount} inválidos ignorados`;
    if (duplicatesRemoved > 0) message += `, ${duplicatesRemoved} duplicatas removidas`;
    
    serverLog('info', 'Arquivo IMEI carregado', { fileName, validCount, invalidCount, duplicatesRemoved });
    showToast('Arquivo Carregado', message, validCount > 0 ? 'success' : 'warning');
    
    // Clear file input
    fileInput.value = '';
}

// Main consultation handler
async function handleConsultar() {
    const imeis = getValidImeis();
    
    if (imeis.length === 0) {
        showToast('Erro', 'Por favor, insira pelo menos um IMEI válido.', 'error');
        return;
    }

    const batchCount = Math.ceil(imeis.length / API_CONFIG.maxBatchSize);
    const confirmMessage = imeis.length > API_CONFIG.maxBatchSize 
        ? `Você está prestes a consultar ${imeis.length} IMEIs em ${batchCount} lotes. Isso pode levar alguns minutos. Deseja continuar?`
        : `Consultar status de ${imeis.length} equipamento${imeis.length > 1 ? 's' : ''}?`;
    
    if (imeis.length > 200 && !confirm(confirmMessage)) {
        return;
    }

    showLoading();
    hideResults();
    
    try {
        deviceResults = [];
        const batches = createBatches(imeis, API_CONFIG.maxBatchSize);
        let processedCount = 0;
        
        showToast('Iniciando', `Processando ${imeis.length} IMEIs em ${batches.length} lote${batches.length > 1 ? 's' : ''}`, 'info');
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const progress = ((i) / batches.length) * 100;
            
            updateProgress(progress, `Processando lote ${i + 1} de ${batches.length} (${batch.length} IMEIs)...`);
            
            try {
                const batchResults = await queryDeviceStatusWithPerformance(batch);
                deviceResults.push(...batchResults);
                processedCount += batch.length;
                
                // Update progress after each batch
                const progressAfterBatch = ((i + 1) / batches.length) * 100;
                updateProgress(progressAfterBatch, `Lote ${i + 1}/${batches.length} concluído (${processedCount}/${imeis.length} IMEIs processados)`);
                
            } catch (error) {
                serverLog('error', `Erro no lote ${i + 1}`, { error: error.message, batchIndex: i });
                showToast('Aviso', `Erro ao processar lote ${i + 1}: ${error.message}`, 'warning');
                
                // Continue with remaining batches even if one fails
                continue;
            }
            
            // Progressive delay to avoid overwhelming the API
            if (i < batches.length - 1) {
                const delay = batches.length > 5 ? 1000 : 500; // Longer delay for many batches
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        updateProgress(100, `Processamento concluído! ${deviceResults.length} equipamentos processados de ${imeis.length} solicitados.`);
        
        // Process results
        processResults();
        
        // Show summary
        const successCount = deviceResults.length;
        const failedCount = imeis.length - successCount;
        
        let summaryMessage = `Consulta concluída! ${successCount} equipamentos processados com sucesso.`;
        if (failedCount > 0) {
            summaryMessage += ` ${failedCount} falharam.`;
        }
        
        // Hide loading and show results
        setTimeout(() => {
            hideLoading();
            showResults();
        }, 1000);
        
        showToast('Sucesso', summaryMessage, successCount > 0 ? 'success' : 'warning');
        
    } catch (error) {
        serverLog('error', 'Erro na consulta principal', { error: error.message });
        hideLoading();
        showToast('Erro', `Erro durante a consulta: ${error.message}`, 'error');
    }
}

// Create batches of IMEIs
function createBatches(imeis, batchSize) {
    const batches = [];
    const totalImeis = imeis.length;
    
    serverLog('info', `Criando lotes para ${totalImeis} IMEIs`, { totalImeis, batchSize });
    
    for (let i = 0; i < totalImeis; i += batchSize) {
        const batch = imeis.slice(i, i + batchSize);
        batches.push(batch);
    }
    
    serverLog('info', `Total de ${batches.length} lotes criados`);
    return batches;
}

// Query device status from API with CORS handling
async function queryDeviceStatus(imeiList, retries = 2) {
    const batchId = Math.random().toString(36).substr(2, 9);
    
    serverLog('info', 'Iniciando consulta de dispositivos', {
        batchId,
        imeiCount: imeiList.length,
        imeis: imeiList.slice(0, 3),
        retries
    });
    
    // First try to use local proxy server
    try {
        const results = await queryWithProxy(imeiList, batchId);
        serverLog('info', 'Sucesso via proxy', { batchId, resultCount: results.length });
        return results;
    } catch (proxyError) {
        serverLog('warn', 'Proxy falhou, tentando acesso direto', {
            batchId,
            error: proxyError.message
        });
    }
    
    // Fallback to direct API access
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const authData = getAuthToken();
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
            
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'appkey': authData.appkey,
                    'timestamp': authData.timestamp,
                    'sign': authData.sign
                },
                body: JSON.stringify({ imeiList }),
                signal: controller.signal,
                mode: 'cors', // Explicitly set CORS mode
                credentials: 'omit' // Don't send credentials
            };
            
            const apiUrl = `${API_CONFIG.endpoint}/queryDeviceStatus`;
            
            serverLog('info', 'Tentativa de acesso direto à API', {
                batchId,
                attempt,
                apiUrl,
                tokenGenerated: !!authData.sign
            });
            
            const response = await fetch(apiUrl, requestOptions);
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            const results = parseApiResponse(data, batchId);
            
            serverLog('info', 'Sucesso no acesso direto', { batchId, resultCount: results.length });
            return results;
            
        } catch (error) {
            serverLog('error', 'Falha na tentativa de acesso direto', {
                batchId,
                attempt,
                error: error.message,
                errorType: error.name
            });
            
            if (error.name === 'AbortError') {
                if (attempt <= retries) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                throw new Error('Timeout na requisição à API. Tente novamente com menos IMEIs.');
            }
            
            if (error.name === 'TypeError' && 
                (error.message.includes('fetch') || 
                 error.message.includes('Failed to fetch') ||
                 error.message.includes('CORS'))) {
                
                if (attempt <= retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
                
                throw new Error('Erro de CORS. Para resolver:\n1. Execute o servidor proxy: npm start\n2. Ou configure CORS no servidor da API\n3. Ou use uma extensão do navegador para desabilitar CORS');
            }
            
            // For HTTP errors or other errors, retry with exponential backoff
            if (attempt <= retries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            throw error;
        }
    }
}

// Query using local proxy server
async function queryWithProxy(imeiList, batchId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for proxy
    
    const proxyUrl = `${API_CONFIG.proxyEndpoint}/queryDeviceStatus`;
    
    serverLog('info', 'Tentando query via proxy', {
        batchId,
        proxyUrl,
        imeiCount: imeiList.length,
        windowLocation: {
            origin: window.location.origin,
            host: window.location.host,
            port: window.location.port
        }
    });
    
    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ imeiList }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro do proxy: ${response.status}`);
        }
        
        const data = await response.json();
        return parseApiResponse(data, batchId);
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Timeout no servidor proxy');
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Servidor proxy não está rodando');
        }
        throw error;
    }
}

// Parse API response to handle different formats
function parseApiResponse(data, batchId) {
    let results = [];
    
    if (Array.isArray(data)) {
        results = data;
    } else if (data && Array.isArray(data.data)) {
        results = data.data;
    } else if (data && data.result && Array.isArray(data.result)) {
        results = data.result;
    } else if (data && data.devices && Array.isArray(data.devices)) {
        results = data.devices;
    } else if (data && data.success !== false) {
        // If we get any object response that's not an error, log it and return empty array
        serverLog('warn', 'Resposta inesperada da API', { batchId, data });
        results = [];
    } else {
        throw new Error(data.message || 'Formato de resposta inválido da API');
    }
    
    return results;
}

// Get authentication token
function getAuthToken() {
    try {
        // For JimiCloud API, generate MD5 signature
        const timestamp = Date.now();
        const signString = `${API_CONFIG.appKey}${timestamp}${API_CONFIG.secret}`;
        
        // Simple MD5 implementation for browser
        const sign = generateMD5(signString);
        
        serverLog('info', 'Token de autenticação gerado', {
            appKey: API_CONFIG.appKey,
            timestamp,
            signStringLength: signString.length,
            signGenerated: !!sign
        });
        
        return {
            appkey: API_CONFIG.appKey,
            timestamp: timestamp.toString(),
            sign: sign
        };
    } catch (error) {
        serverLog('error', 'Erro ao gerar token de autenticação', {
            error: error.message,
            stack: error.stack
        });
        throw new Error('Erro ao gerar token de autenticação: ' + error.message);
    }
}

// Simple MD5 hash function for browser - Pure JavaScript implementation
function generateMD5(str) {
    if (!str) {
        throw new Error('String para hash MD5 está vazia');
    }
    
    try {
        // MD5 Pure JavaScript implementation
        function md5(d) {
            var r = M(V(Y(X(d), 8 * d.length)));
            return r.toLowerCase();
        }
        function M(d) {
            for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++) _ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _);
            return f;
        }
        function X(d) {
            for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
            for (m = 0; m < 8 * d.length; m += 8) _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
            return _;
        }
        function V(d) {
            for (var _ = "", m = 0; m < 32 * d.length; m += 8) _ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255);
            return _;
        }
        function Y(d, _) {
            d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _;
            for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
                var h = m, t = f, g = r, e = i;
                f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e);
            }
            return Array(m, f, r, i);
        }
        function md5_cmn(d, _, m, f, r, i) {
            return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m);
        }
        function md5_ff(d, _, m, f, r, i, n) {
            return md5_cmn(_ & m | ~_ & f, d, _, r, i, n);
        }
        function md5_gg(d, _, m, f, r, i, n) {
            return md5_cmn(_ & f | m & ~f, d, _, r, i, n);
        }
        function md5_hh(d, _, m, f, r, i, n) {
            return md5_cmn(_ ^ m ^ f, d, _, r, i, n);
        }
        function md5_ii(d, _, m, f, r, i, n) {
            return md5_cmn(m ^ (_ | ~f), d, _, r, i, n);
        }
        function safe_add(d, _) {
            var m = (65535 & d) + (65535 & _);
            return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m;
        }
        function bit_rol(d, _) {
            return d << _ | d >>> 32 - _;
        }
        
        const result = md5(str);
        return result;
        
    } catch (error) {
        serverLog('error', 'Erro na função MD5', { error: error.message });
        throw error;
    }
}

// Process and enhance results
function processResults() {
    deviceResults.forEach(device => {
        // Extract firmware version
        device.firmwareVersion = extractFirmwareVersion(device);
        
        // Calculate offline status and days
        const offlineInfo = calculateOfflineStatus(device.lastTime);
        device.isOnline = offlineInfo.isOnline;
        device.offlineDays = offlineInfo.offlineDays;
        device.lastTimeBrasilia = offlineInfo.lastTimeBrasilia;
        
        // Parse additional info from selfCheckParam
        device.parsedSelfCheck = parseSelfCheckParam(device.selfCheckParam);
        
        // Extract SD card information
        device.sdCardInfo = extractSDCardInfo(device.log);
        
        // Extract additional system information
        device.systemInfo = extractSystemInfo(device.log);
    });
    
    filteredResults = [...deviceResults];
}

// Extract firmware version from device data
function extractFirmwareVersion(device) {
    // First try the version field
    if (device.version && device.version.trim()) {
        return device.version.trim();
    }
    
    // If not available, extract from selfCheckParam
    if (device.selfCheckParam) {
        const versionMatch = device.selfCheckParam.match(/VERSION:([^;]+)/);
        if (versionMatch) {
            return versionMatch[1].trim();
        }
    }
    
    // Robust search: scan all fields in the JSON for anything starting with "C450"
    try {
        const firmwarePattern = /C450[a-zA-Z]*[_-]?v?\d+\.\d+\.\d+[_-]?\d*/i;
        
        // Search through all object properties recursively
        function searchForFirmware(obj, depth = 0) {
            if (depth > 3) return null; // Prevent infinite recursion
            
            if (!obj || typeof obj !== 'object') return null;
            
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string' && firmwarePattern.test(value)) {
                    return value.trim();
                }
                
                // Recursively search nested objects
                if (typeof value === 'object' && value !== null) {
                    const nested = searchForFirmware(value, depth + 1);
                    if (nested) return nested;
                }
            }
            
            return null;
        }
        
        const foundFirmware = searchForFirmware(device);
        if (foundFirmware) {
            return foundFirmware;
        }
        
    } catch (error) {
        // Erro na busca robusta, não registrar
    }
    
    return 'Não disponível';
}

// Calculate offline status and convert timezone
function calculateOfflineStatus(lastTimeStr) {
    if (!lastTimeStr) {
        return {
            isOnline: false,
            offlineDays: 'N/A',
            lastTimeBrasilia: 'N/A'
        };
    }
    
    try {
        // Parse the UTC time from API (China timezone)
        const lastTime = new Date(lastTimeStr);
        
        // Convert to Brazil timezone (UTC-3)
        const brasiliaOffset = -3 * 60; // minutes
        const lastTimeBrasilia = new Date(lastTime.getTime() + (brasiliaOffset * 60 * 1000));
        
        // Calculate difference with current time in Brazil
        const now = new Date();
        const diffMs = now.getTime() - lastTime.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        // Consider online if last communication was within 24 hours
        const isOnline = diffDays < 1;
        
        return {
            isOnline,
            offlineDays: isOnline ? 0 : diffDays,
            lastTimeBrasilia: lastTimeBrasilia.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };
    } catch (error) {
        serverLog('error', 'Erro ao processar data', { error: error.message });
        return {
            isOnline: false,
            offlineDays: 'Erro',
            lastTimeBrasilia: 'Erro'
        };
    }
}

// Parse selfCheckParam string
function parseSelfCheckParam(selfCheckParam) {
    if (!selfCheckParam) return {};
    
    const parsed = {};
    const pairs = selfCheckParam.split(';');
    
    pairs.forEach(pair => {
        const parts = pair.split(':');
        const key = parts[0];
        const value = parts[1];
        if (key && value) {
            parsed[key.trim()] = value.trim();
        }
    });
    
    return parsed;
}

// Extract SD card information from log field
function extractSDCardInfo(log) {
    if (!log) return null;
    
    const sdInfo = {
        sd1: null,
        sd2: null,
        memory: null
    };
    
    // Função segura para extrair informações
    function safeExtract(match) {
        if (!match || !match[1]) return { total: 'N/A', used: 'N/A' };
        
        const value = match[1].trim();
        // Verifica se há uma barra no valor (formato: total/usado)
        if (value.includes('/')) {
            const parts = value.split('/');
            return {
                total: parts[0] ? parts[0].trim() : 'N/A',
                used: parts[1] ? parts[1].trim() : 'N/A'
            };
        } else {
            // Se não tem barra, assume que só tem o valor total
            return {
                total: value,
                used: 'N/A'
            };
        }
    }
    
    // Extract SD1 info: SD1:233 GB/2.18 GB (ou simplesmente SD1:233 GB)
    const sd1Match = log.match(/SD1:([^,]+)/);
    if (sd1Match) {
        const info = safeExtract(sd1Match);
        sdInfo.sd1 = {
            total: info.total,
            used: info.used,
            status: 'Conectado'
        };
    }
    
    // Extract SD2 info: SD2:233 GB/2.06 GB (ou simplesmente SD2:233 GB)
    const sd2Match = log.match(/SD2:([^,]+)/);
    if (sd2Match) {
        const info = safeExtract(sd2Match);
        sdInfo.sd2 = {
            total: info.total,
            used: info.used,
            status: 'Conectado'
        };
    }
    
    // Extract memory info: MEMORY:2.75 GB/561 MB (ou simplesmente MEMORY:2.75 GB)
    const memoryMatch = log.match(/MEMORY:([^,]+)/);
    if (memoryMatch) {
        const info = safeExtract(memoryMatch);
        sdInfo.memory = {
            total: info.total,
            used: info.used
        };
    }
    
    return sdInfo;
}

// Extract additional system information from log
function extractSystemInfo(log) {
    if (!log) return {};
    
    const systemInfo = {};
    
    // Network info
    const networkMatch = log.match(/NETWORK:([^,]+)/);
    if (networkMatch) {
        systemInfo.network = networkMatch[1].trim();
    }
    
    // GPS info
    const gpsMatch = log.match(/GPS:([^,]+)/);
    if (gpsMatch) {
        systemInfo.gps = gpsMatch[1].trim();
    }
    
    // ACC status
    const accMatch = log.match(/ACC:([^,]+)/);
    if (accMatch) {
        systemInfo.acc = accMatch[1].trim();
    }
    
    // Power info
    const powerMatch = log.match(/POWER:([^,]+)/);
    if (powerMatch) {
        systemInfo.power = powerMatch[1].trim() + 'V';
    }
    
    // CPU Temperature
    const cpuTempMatch = log.match(/CPU_TEMP:([^,]+)/);
    if (cpuTempMatch) {
        systemInfo.cpuTemp = cpuTempMatch[1].trim() + '°C';
    }
    
    // Channel status
    const channels = [];
    for (let i = 1; i <= 5; i++) {
        const channelMatch = log.match(new RegExp(`CH${i}:([^,]+)`));
        if (channelMatch) {
            channels.push({
                channel: `CH${i}`,
                status: channelMatch[1].trim()
            });
        }
    }
    systemInfo.channels = channels;
    
    return systemInfo;
}

// Show loading state
function showLoading() {
    loadingSection.classList.remove('hidden');
    updateProgress(0, 'Iniciando consulta...');
}

// Hide loading state
function hideLoading() {
    loadingSection.classList.add('hidden');
}

// Update progress bar
function updateProgress(percentage, text) {
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${Math.round(percentage)}%`;
    loadingText.textContent = text;
}

// Show results section
function showResults() {
    if (deviceResults.length === 0) {
        showToast('Aviso', 'Nenhum resultado encontrado.', 'warning');
        return;
    }
    
    // Cache the results
    if (cacheManager) {
        const cacheKey = `results_${Date.now()}`;
        cacheManager.setQueryResult(cacheKey, deviceResults);
    }
    
    // Compare firmware if reference is set
    if (firmwareManager && firmwareManager.getReferenceFirmware()) {
        updateResultsWithFirmwareComparison();
    }
    
    updateResultsSummary();
    renderResults();
    resultsSection.classList.remove('hidden');
    
    // Show dashboard section after results
    if (deviceResults.length > 0) {
        dashboardSection.classList.remove('hidden');
        
        // Show firmware analysis toast
        if (firmwareManager && firmwareManager.getReferenceFirmware()) {
            const analysis = firmwareManager.analyzeFirmwareDistribution(deviceResults);
            if (analysis.outdated > 0) {
                const updatePercent = ((analysis.outdated / analysis.total) * 100).toFixed(1);
                showToast('Análise de Firmware', 
                    `${analysis.outdated} equipamentos (${updatePercent}%) precisam de atualização`, 
                    'warning', 6000);
            } else {
                showToast('Análise de Firmware', 
                    'Todos os equipamentos estão com firmware atualizado!', 
                    'success', 4000);
            }
        }
    }
}

// Hide results section
function hideResults() {
    resultsSection.classList.add('hidden');
}

// Update results summary
function updateResultsSummary() {
    const total = deviceResults.length;
    const online = deviceResults.filter(d => d.isOnline).length;
    const offline = total - online;
    
    totalResults.innerHTML = `<i class="fas fa-mobile-alt"></i> Total: ${total}`;
    onlineResults.innerHTML = `<i class="fas fa-wifi"></i> Online: ${online}`;
    offlineResults.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Offline: ${offline}`;
}

// Render results list
function renderResults() {
    if (filteredResults.length === 0) {
        resultsList.innerHTML = `
            <div class="text-center" style="padding: 2rem; color: #718096;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                Nenhum resultado encontrado com os filtros aplicados.
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = filteredResults.map(device => `
        <div class="device-item ${device.isOnline ? 'online' : 'offline'}" onclick="showDeviceDetails('${device.imei}')">
            <div class="device-header">
                <div class="device-imei">${device.imei}</div>
                <div class="device-status ${device.isOnline ? 'online' : 'offline'}">
                    <i class="fas fa-${device.isOnline ? 'wifi' : 'exclamation-triangle'}"></i>
                    ${device.isOnline ? 'Online' : 'Offline'}
                </div>
            </div>
            <div class="device-info">
                <div class="info-item">
                    <div class="info-label">Firmware</div>
                    <div class="info-value firmware-version">
                        ${device.firmwareVersion}
                        ${device.firmwareComparison ? generateFirmwareStatusBadge(device.firmwareComparison) : ''}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Última Comunicação</div>
                    <div class="info-value">${device.lastTimeBrasilia || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value ${!device.isOnline ? 'offline-days' : ''}">
                        ${device.isOnline ? 'Equipamento Online' : `Offline há ${device.offlineDays} dias`}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Potência</div>
                    <div class="info-value">${device.power || device.systemInfo?.power || 'N/A'}</div>
                </div>
                ${device.sdCardInfo?.sd1 ? `
                <div class="info-item">
                    <div class="info-label">Cartão SD1</div>
                    <div class="info-value">${device.sdCardInfo.sd1.used} / ${device.sdCardInfo.sd1.total}</div>
                </div>
                ` : ''}
                ${device.sdCardInfo?.sd2 ? `
                <div class="info-item">
                    <div class="info-label">Cartão SD2</div>
                    <div class="info-value">${device.sdCardInfo.sd2.used} / ${device.sdCardInfo.sd2.total}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Status filter handler
function handleStatusFilter() {
    const filterValue = statusFilter.value;
    applyFilters();
}

// Search filter handler
function handleSearchFilter() {
    applyFilters();
}

// Apply all filters
function applyFilters() {
    const statusValue = statusFilter.value;
    const searchValue = searchFilter.value.toLowerCase().trim();
    
    filteredResults = deviceResults.filter(device => {
        // Status filter
        const statusMatch = statusValue === 'all' || 
                          (statusValue === 'online' && device.isOnline) ||
                          (statusValue === 'offline' && !device.isOnline);
        
        // Search filter
        const searchMatch = !searchValue || device.imei.toLowerCase().includes(searchValue);
        
        return statusMatch && searchMatch;
    });
    
    renderResults();
}

// Show device details in modal
function showDeviceDetails(imei) {
    const device = deviceResults.find(d => d.imei === imei);
    if (!device) {
        serverLog('error', 'Dispositivo não encontrado', { imei });
        return;
    }
    
    modalTitle.textContent = `Detalhes - IMEI: ${device.imei}`;
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-info-circle"></i>
                Informações Básicas
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">IMEI</div>
                    <div class="detail-value code">${device.imei}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Versão do Firmware</div>
                    <div class="detail-value code">${device.firmwareVersion}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status de Conexão</div>
                    <div class="detail-value">
                        <span class="device-status ${device.isOnline ? 'online' : 'offline'}">
                            <i class="fas fa-${device.isOnline ? 'wifi' : 'exclamation-triangle'}"></i>
                            ${device.isOnline ? 'Online' : `Offline há ${device.offlineDays} dias`}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Servidor</div>
                    <div class="detail-value code">${device.server || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        ${device.firmwareComparison ? `
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-microchip"></i>
                Análise de Firmware
            </div>
            <div class="detail-content">
                <div class="firmware-status-detail">
                    ${generateFirmwareStatusBadge(device.firmwareComparison)}
                </div>
                ${generateFirmwareComparisonDetails(device.firmwareComparison)}
                <div class="firmware-recommendation">
                    ${device.firmwareComparison.status === 'outdated' ? 
                        '<p><i class="fas fa-download"></i> <strong>Recomendação:</strong> Atualização necessária para a versão mais recente.</p>' :
                        device.firmwareComparison.status === 'updated' ?
                        '<p><i class="fas fa-check-circle"></i> <strong>Status:</strong> Firmware está atualizado.</p>' :
                        '<p><i class="fas fa-info-circle"></i> <strong>Status:</strong> Firmware mais recente que a referência.</p>'
                    }
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-clock"></i>
                Informações de Tempo
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Primeira Comunicação</div>
                    <div class="detail-value">${device.firstTime ? new Date(device.firstTime).toLocaleString('pt-BR') : 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Última Comunicação (UTC)</div>
                    <div class="detail-value">${device.lastTime ? new Date(device.lastTime).toLocaleString('pt-BR') : 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Última Comunicação (Brasília)</div>
                    <div class="detail-value">${device.lastTimeBrasilia || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-battery-half"></i>
                Informações Técnicas
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Potência</div>
                    <div class="detail-value">${device.power || 'N/A'}${device.power ? 'V' : ''}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Qualidade do Sinal (CSQ)</div>
                    <div class="detail-value">${device.csq || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Bateria</div>
                    <div class="detail-value">${device.bat || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Tensão</div>
                    <div class="detail-value">${device.voltage || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Temperatura</div>
                    <div class="detail-value">${device.temperature || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">MCU</div>
                    <div class="detail-value">${device.mcu || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-sim-card"></i>
                Informações de Conectividade
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">ICCID</div>
                    <div class="detail-value code">${device.iccid || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">IP Obtido</div>
                    <div class="detail-value code">${device.getIp || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Modo</div>
                    <div class="detail-value">${device.mode || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        ${device.sdCardInfo && (device.sdCardInfo.sd1 || device.sdCardInfo.sd2 || device.sdCardInfo.memory) ? `
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-sd-card"></i>
                Informações de Armazenamento
            </div>
            <div class="detail-grid">
                ${device.sdCardInfo.memory ? `
                <div class="detail-item">
                    <div class="detail-label">Memória Interna</div>
                    <div class="detail-value">${device.sdCardInfo.memory.used} / ${device.sdCardInfo.memory.total}</div>
                </div>
                ` : ''}
                ${device.sdCardInfo.sd1 ? `
                <div class="detail-item">
                    <div class="detail-label">Cartão SD1</div>
                    <div class="detail-value">
                        <div>${device.sdCardInfo.sd1.used} / ${device.sdCardInfo.sd1.total}</div>
                        <div style="font-size: 0.85em; color: #16a085;">${device.sdCardInfo.sd1.status}</div>
                    </div>
                </div>
                ` : ''}
                ${device.sdCardInfo.sd2 ? `
                <div class="detail-item">
                    <div class="detail-label">Cartão SD2</div>
                    <div class="detail-value">
                        <div>${device.sdCardInfo.sd2.used} / ${device.sdCardInfo.sd2.total}</div>
                        <div style="font-size: 0.85em; color: #16a085;">${device.sdCardInfo.sd2.status}</div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        ${device.systemInfo && Object.keys(device.systemInfo).length > 0 ? `
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-microchip"></i>
                Status do Sistema
            </div>
            <div class="detail-grid">
                ${device.systemInfo.network ? `
                <div class="detail-item">
                    <div class="detail-label">Rede</div>
                    <div class="detail-value">${device.systemInfo.network}</div>
                </div>
                ` : ''}
                ${device.systemInfo.gps ? `
                <div class="detail-item">
                    <div class="detail-label">GPS</div>
                    <div class="detail-value">${device.systemInfo.gps}</div>
                </div>
                ` : ''}
                ${device.systemInfo.acc ? `
                <div class="detail-item">
                    <div class="detail-label">ACC</div>
                    <div class="detail-value">${device.systemInfo.acc}</div>
                </div>
                ` : ''}
                ${device.systemInfo.power ? `
                <div class="detail-item">
                    <div class="detail-label">Voltagem do Sistema</div>
                    <div class="detail-value">${device.systemInfo.power}</div>
                </div>
                ` : ''}
                ${device.systemInfo.cpuTemp ? `
                <div class="detail-item">
                    <div class="detail-label">Temperatura CPU</div>
                    <div class="detail-value">${device.systemInfo.cpuTemp}</div>
                </div>
                ` : ''}
            </div>
            ${device.systemInfo.channels && device.systemInfo.channels.length > 0 ? `
            <div class="detail-item">
                <div class="detail-label">Status dos Canais</div>
                <div class="detail-value">
                    ${device.systemInfo.channels.map(ch => `
                        <span style="display: inline-block; margin-right: 15px; padding: 2px 8px; background: ${ch.status === 'Normal' ? '#d4edda' : '#f8d7da'}; border-radius: 4px; font-size: 0.85em;">
                            ${ch.channel}: ${ch.status}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        ` : ''}
        
        ${device.log ? `
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-file-alt"></i>
                Log do Sistema
            </div>
            <div class="detail-item">
                <div class="detail-label">Log Completo</div>
                <div class="detail-value code" style="white-space: pre-wrap; word-break: break-word;">${device.log}</div>
            </div>
        </div>
        ` : ''}
        
        ${device.selfCheckParam ? `
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-cogs"></i>
                Parâmetros de Auto-Verificação
            </div>
            <div class="detail-item">
                <div class="detail-label">Parâmetros Completos</div>
                <div class="detail-value code" style="white-space: pre-wrap; word-break: break-word;">${device.selfCheckParam}</div>
            </div>
        </div>
        ` : ''}
        
        ${Object.keys(device.parsedSelfCheck || {}).length > 0 ? `
        <div class="detail-section">
            <div class="detail-title">
                <i class="fas fa-list"></i>
                Parâmetros Detalhados
            </div>
            <div class="detail-grid">
                ${Object.entries(device.parsedSelfCheck).map(([key, value]) => `
                    <div class="detail-item">
                        <div class="detail-label">${key}</div>
                        <div class="detail-value code">${value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
    
    // Verificar se há modal de firmware aberto e ajustar z-index
    const firmwareModal = document.getElementById('firmwareModal');
    if (firmwareModal && firmwareModal.classList.contains('show')) {
        // Se modal de firmware está aberto, usar z-index maior e classe especial
        deviceModal.style.zIndex = '2100';
        deviceModal.classList.add('overlay-modal');
    } else {
        // Usar z-index padrão e remover classe especial
        deviceModal.style.zIndex = '1000';
        deviceModal.classList.remove('overlay-modal');
    }
    
    deviceModal.classList.remove('hidden');
}

// Hide modal
function hideModal() {
    deviceModal.classList.add('hidden');
    // Resetar z-index e remover classe especial ao fechar
    deviceModal.style.zIndex = '1000';
    deviceModal.classList.remove('overlay-modal');
}

// Função global para fechar modal de firmware
function closeFirmwareModal() {
    if (typeof dashboardManager !== 'undefined') {
        dashboardManager.closeFirmwareModal();
    }
}

// Toast notification system
function showToast(title, message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconClass = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, duration);
    
    // Click to close
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toastContainer.removeChild(toast);
        }
    });
}

// Dashboard functions
function handleToggleDashboard() {
    const isHidden = dashboardContent.classList.contains('hidden');
    
    if (isHidden) {
        if (deviceResults.length === 0) {
            showToast('Aviso', 'Execute uma consulta primeiro para visualizar o dashboard.', 'warning');
            return;
        }
        
        dashboardContent.classList.remove('hidden');
        dashboardSection.classList.remove('hidden');
        toggleDashboard.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Dashboard';
        
        // Generate dashboard
        generateDashboard();
    } else {
        dashboardContent.classList.add('hidden');
        toggleDashboard.innerHTML = '<i class="fas fa-eye"></i> Mostrar Dashboard';
    }
}

function generateDashboard() {
    if (!dashboardManager) {
        showToast('Erro', 'Dashboard não inicializado corretamente.', 'error');
        return;
    }
    
    if (deviceResults.length === 0) {
        document.getElementById('generalMetrics').innerHTML = '<p class="text-center">Nenhum dado disponível</p>';
        document.getElementById('connectivityChart').innerHTML = '<p class="text-center">Execute uma consulta para ver os gráficos</p>';
        document.getElementById('firmwareChart').innerHTML = '<p class="text-center">Execute uma consulta para ver os gráficos</p>';
        document.getElementById('storageChart').innerHTML = '<p class="text-center">Execute uma consulta para ver os gráficos</p>';
        return;
    }
    
    try {
        // Check if elements exist before trying to access them
        const elements = {
            generalMetrics: document.getElementById('generalMetrics'),
            connectivityChart: document.getElementById('connectivityChart'),
            firmwareChart: document.getElementById('firmwareChart'),
            storageChart: document.getElementById('storageChart')
        };
        
        // Verify all elements exist
        const missingElements = Object.entries(elements)
            .filter(([name, element]) => !element)
            .map(([name]) => name);
            
        if (missingElements.length > 0) {
            console.warn('⚠️ Elementos do dashboard não encontrados:', missingElements);
            return;
        }
        
        // Show loading state
        const loadingHtml = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Gerando...</div>';
        elements.generalMetrics.innerHTML = loadingHtml;
        elements.connectivityChart.innerHTML = loadingHtml;
        elements.firmwareChart.innerHTML = loadingHtml;
        elements.storageChart.innerHTML = loadingHtml;
        
        // Generate dashboard components with delay for smooth UX
        setTimeout(() => {
            try {
                const generalMetrics = dashboardManager.generateGeneralMetricsWithFirmware ? 
                    dashboardManager.generateGeneralMetricsWithFirmware(deviceResults, firmwareManager) :
                    dashboardManager.generateGeneralMetrics(deviceResults);
                elements.generalMetrics.innerHTML = generalMetrics;
            } catch (error) {
                console.error('❌ Erro ao gerar métricas gerais:', error);
                elements.generalMetrics.innerHTML = '<p class="text-center text-error">Erro ao carregar métricas</p>';
            }
        }, 100);
        
        setTimeout(() => {
            try {
                if (typeof dashboardManager.generateConnectivityChart === 'function') {
                    const connectivityChart = dashboardManager.generateConnectivityChart(deviceResults);
                    elements.connectivityChart.innerHTML = connectivityChart;
                } else {
                    // Create simple connectivity status display
                    const online = deviceResults.filter(d => d.isOnline).length;
                    const offline = deviceResults.length - online;
                    const connectivityHtml = `
                        <div class="simple-chart">
                            <div class="connectivity-stats">
                                <div class="stat-item online">
                                    <span class="stat-number">${online}</span>
                                    <span class="stat-label">Online</span>
                                </div>
                                <div class="stat-item offline">
                                    <span class="stat-number">${offline}</span>
                                    <span class="stat-label">Offline</span>
                                </div>
                            </div>
                        </div>
                    `;
                    elements.connectivityChart.innerHTML = connectivityHtml;
                }
            } catch (error) {
                console.error('❌ Erro ao gerar gráfico de conectividade:', error);
                elements.connectivityChart.innerHTML = '<p class="text-center text-error">Erro ao carregar gráfico</p>';
            }
        }, 200);
        
        setTimeout(() => {
            try {
                if (dashboardManager.generateFirmwareMetrics && typeof dashboardManager.generateFirmwareMetrics === 'function') {
                    const firmwareChart = dashboardManager.generateFirmwareMetrics(deviceResults, firmwareManager);
                    elements.firmwareChart.innerHTML = firmwareChart;
                } else if (typeof dashboardManager.generateFirmwareChart === 'function') {
                    const firmwareChart = dashboardManager.generateFirmwareChart(deviceResults);
                    elements.firmwareChart.innerHTML = firmwareChart;
                } else {
                    elements.firmwareChart.innerHTML = '<p class="text-center">Análise de firmware não disponível</p>';
                }
            } catch (error) {
                console.error('❌ Erro ao gerar análise de firmware:', error);
                elements.firmwareChart.innerHTML = '<p class="text-center text-error">Erro ao carregar análise</p>';
            }
        }, 300);
        
        setTimeout(() => {
            try {
                if (typeof dashboardManager.generateStorageChart === 'function') {
                    const storageChart = dashboardManager.generateStorageChart(deviceResults);
                    elements.storageChart.innerHTML = storageChart;
                } else {
                    // Create simple storage status display
                    const storageIssues = deviceResults.filter(d => {
                        if (!d.sdCardInfo) return false;
                        const checkUsage = (sd) => {
                            if (!sd) return false;
                            const used = parseFloat(sd.used);
                            const total = parseFloat(sd.total);
                            return (used / total) > 0.9;
                        };
                        return checkUsage(d.sdCardInfo.sd1) || 
                               checkUsage(d.sdCardInfo.sd2) ||
                               checkUsage(d.sdCardInfo.memory);
                    }).length;
                    
                    const storageHtml = `
                        <div class="simple-chart">
                            <div class="storage-stats">
                                <div class="stat-item ${storageIssues > 0 ? 'warning' : 'success'}">
                                    <span class="stat-number">${storageIssues}</span>
                                    <span class="stat-label">Com Problemas</span>
                                </div>
                                <div class="stat-item success">
                                    <span class="stat-number">${deviceResults.length - storageIssues}</span>
                                    <span class="stat-label">OK</span>
                                </div>
                            </div>
                        </div>
                    `;
                    elements.storageChart.innerHTML = storageHtml;
                }
            } catch (error) {
                console.error('❌ Erro ao gerar análise de armazenamento:', error);
                elements.storageChart.innerHTML = '<p class="text-center text-error">Erro ao carregar análise</p>';
            }
        }, 400);
        
        // Success message after all components load
        setTimeout(() => {
            showToast('Dashboard', 'Dashboard atualizado com sucesso!', 'success', 2000);
        }, 500);
        
    } catch (error) {
        console.error('Erro ao gerar dashboard:', error);
        showToast('Erro', 'Erro ao gerar dashboard: ' + error.message, 'error');
        
        // Restore error state
        const errorHtml = '<p class="text-center text-error">Erro ao carregar dados</p>';
        document.getElementById('generalMetrics').innerHTML = errorHtml;
        document.getElementById('connectivityChart').innerHTML = errorHtml;
        document.getElementById('firmwareChart').innerHTML = errorHtml;
        document.getElementById('storageChart').innerHTML = errorHtml;
    }
}

// Export functions
function handleExport(format) {
    if (deviceResults.length === 0) {
        showToast('Aviso', 'Nenhum resultado para exportar. Execute uma consulta primeiro.', 'warning');
        return;
    }
    
    if (!exportManager) {
        showToast('Erro', 'Sistema de exportação não inicializado corretamente.', 'error');
        return;
    }
    
    try {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `allcom_jc450_resultados_${timestamp}`;
        
        switch (format) {
            case 'csv':
                exportManager.exportToCSV(deviceResults, filename);
                showToast('Exportação', 'Arquivo CSV exportado com sucesso!', 'success');
                break;
                
            case 'excel':
                exportManager.exportToExcel(deviceResults, filename);
                showToast('Exportação', 'Arquivo Excel exportado com sucesso!', 'success');
                break;
                
            case 'json':
                exportManager.exportToJSON(deviceResults, filename);
                showToast('Exportação', 'Arquivo JSON exportado com sucesso!', 'success');
                break;
                
            default:
                throw new Error('Formato de exportação não suportado: ' + format);
        }
    } catch (error) {
        console.error('Erro na exportação:', error);
        showToast('Erro', 'Erro na exportação: ' + error.message, 'error');
    }
}

// Enhanced query function with performance management
async function queryDeviceStatusWithPerformance(imeis) {
    if (!performanceManager) {
        // Fallback to original function if performance manager not available
        return await queryDeviceStatus(imeis);
    }
    
    // Check if circuit breaker allows the request
    if (!performanceManager.canMakeRequest()) {
        throw new Error('Sistema temporariamente indisponível devido a muitos erros. Aguarde alguns minutos antes de tentar novamente.');
    }
    
    try {
        // Use performance manager with retry logic
        const result = await performanceManager.executeWithRetry(async () => {
            return await queryDeviceStatus(imeis);
        });
        
        performanceManager.recordSuccess();
        
        // Log successful batch
        console.log(`✅ Lote processado com sucesso: ${imeis.length} IMEIs`);
        
        return result;
    } catch (error) {
        performanceManager.recordFailure();
        
        // Enhanced error logging
        console.error('❌ Erro no lote:', {
            imeis: imeis.length,
            error: error.message,
            circuitBreakerState: performanceManager.getCircuitBreakerState()
        });
        
        // Provide more specific error messages
        if (error.message.includes('timeout')) {
            throw new Error(`Timeout ao processar lote de ${imeis.length} IMEIs. A API pode estar sobrecarregada.`);
        } else if (error.message.includes('401') || error.message.includes('403')) {
            throw new Error(`Erro de autenticação. Verifique as credenciais da API.`);
        } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
            throw new Error(`Servidor da API indisponível. Tente novamente em alguns minutos.`);
        }
        
        throw error;
    }
}

// Enhanced results display with caching
function displayResultsWithCaching(results) {
    // Cache the results
    if (cacheManager) {
        const cacheKey = `results_${Date.now()}`;
        cacheManager.setQueryResult(cacheKey, results);
    }
    
    // Display normally
    displayResults(results);
    
    // Show dashboard section after results
    if (results.length > 0) {
        dashboardSection.classList.remove('hidden');
    }
}

// User preferences management
function loadUserPreferences() {
    try {
        // Check if cacheManager is available
        if (!cacheManager) {
            console.log('⚠️ Cache manager não inicializado ainda');
            return;
        }
        
        if (typeof cacheManager.getUserPreferences !== 'function') {
            console.log('⚠️ Método getUserPreferences não disponível no cache manager');
            return;
        }
        
        const preferences = cacheManager.getUserPreferences();
        console.log('📋 Preferências carregadas:', preferences);
        
        // Apply saved filter preferences
        if (preferences.statusFilter && statusFilter) {
            statusFilter.value = preferences.statusFilter;
            console.log('✅ Filtro de status aplicado:', preferences.statusFilter);
        }
        
        // Apply saved dashboard state
        if (preferences.dashboardVisible && deviceResults.length > 0) {
            setTimeout(() => {
                if (typeof handleToggleDashboard === 'function') {
                    handleToggleDashboard();
                    console.log('✅ Dashboard estado aplicado');
                }
            }, 500);
        }
        
        console.log('✅ Preferências do usuário carregadas com sucesso');
    } catch (error) {
        console.error('❌ Erro ao carregar preferências:', error);
    }
}

function saveUserPreferences() {
    try {
        // Check if cacheManager is available
        if (!cacheManager) {
            console.log('⚠️ Cache manager não inicializado ainda');
            return;
        }
        
        if (typeof cacheManager.setUserPreferences !== 'function') {
            console.log('⚠️ Método setUserPreferences não disponível no cache manager');
            return;
        }
        
        const preferences = {
            statusFilter: statusFilter ? statusFilter.value : '',
            dashboardVisible: dashboardContent ? !dashboardContent.classList.contains('hidden') : false,
            lastUsed: Date.now()
        };
        
        cacheManager.setUserPreferences(preferences);
        console.log('💾 Preferências salvas com sucesso:', preferences);
    } catch (error) {
        console.error('❌ Erro ao salvar preferências:', error);
    }
}

// Auto-save preferences on changes
function setupPreferencesAutoSave() {
    // Save filter preferences
    statusFilter.addEventListener('change', saveUserPreferences);
    
    // Save dashboard state when toggled
    const originalToggle = handleToggleDashboard;
    handleToggleDashboard = function() {
        originalToggle();
        setTimeout(saveUserPreferences, 100);
    };
}

// Performance monitoring
function startPerformanceMonitoring() {
    if (!performanceManager) return;
    
    // Monitor every 30 seconds
    setInterval(() => {
        const stats = performanceManager.getPerformanceStats();
        
        if (stats.failureRate > 0.5) { // 50% failure rate
            showToast('Performance', 'Alta taxa de erro detectada. Sistema pode estar instável.', 'warning', 3000);
        }
        
        console.log('📊 Performance Stats:', stats);
    }, 30000);
}

// Firmware Management Functions
function initializeFirmwareInterface() {
    if (!firmwareManager) {
        console.error('❌ Firmware Manager não inicializado');
        return;
    }
    
    // Check if DOM elements exist
    if (!firmwareSelect || !currentFirmwareDisplay || !selectedFirmwareText) {
        console.error('❌ Elementos DOM de firmware não encontrados');
        return;
    }
    
    try {
        // Populate firmware dropdown
        populateFirmwareDropdown();
        
        // Load saved reference firmware
        const referenceFirmware = firmwareManager.getReferenceFirmware();
        if (referenceFirmware) {
            firmwareSelect.value = referenceFirmware;
            updateCurrentFirmwareDisplay(referenceFirmware);
        }
        
        console.log('✅ Interface de firmware inicializada');
    } catch (error) {
        console.error('❌ Erro ao inicializar interface de firmware:', error);
        if (typeof showToast === 'function') {
            showToast('Erro', 'Erro ao inicializar gerenciamento de firmware', 'error');
        }
    }
}

function populateFirmwareDropdown() {
    if (!firmwareManager || typeof firmwareManager.getAllFirmwares !== 'function') {
        console.error('❌ FirmwareManager não disponível para popular dropdown');
        return;
    }
    
    if (!firmwareSelect) {
        console.error('❌ Elemento firmwareSelect não encontrado');
        return;
    }
    
    try {
        const allFirmwares = firmwareManager.getAllFirmwares();
        
        // Clear existing options except the first ones
        while (firmwareSelect.children.length > 1) {
            firmwareSelect.removeChild(firmwareSelect.lastChild);
        }
        
        // Add predefined firmwares
        allFirmwares.forEach((firmware, index) => {
            const option = document.createElement('option');
            option.value = firmware;
            option.textContent = index === 0 ? `${firmware} (Mais Recente)` : firmware;
            firmwareSelect.appendChild(option);
        });
        
        // Add custom option
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = '✏️ Adicionar novo firmware...';
        firmwareSelect.appendChild(customOption);
        
        console.log('✅ Dropdown de firmware populado com', allFirmwares.length, 'versões');
    } catch (error) {
        console.error('❌ Erro ao popular dropdown de firmware:', error);
    }
}

function handleFirmwareSelect(event) {
    const selectedValue = event.target.value;
    console.log('🔧 Firmware selecionado:', selectedValue);
    
    if (selectedValue === 'custom') {
        showCustomFirmwareInput();
    } else if (selectedValue) {
        try {
            console.log('🔄 Tentando definir firmware de referência...');
            
            // Verificar se o firmware manager está disponível
            if (!firmwareManager) {
                throw new Error('Firmware Manager não inicializado');
            }
            
            // Testar se o firmware pode ser parseado
            const parsed = firmwareManager.parseFirmwareVersion(selectedValue);
            console.log('📋 Firmware parseado:', parsed);
            
            if (!parsed) {
                throw new Error(`Formato de firmware inválido: ${selectedValue}`);
            }
            
            firmwareManager.setReferenceFirmware(selectedValue);
            updateCurrentFirmwareDisplay(selectedValue);
            hideCustomFirmwareInput();
            
            // Update results if they exist
            if (deviceResults.length > 0) {
                console.log('🔄 Atualizando resultados com comparação de firmware...');
                updateResultsWithFirmwareComparison();
                generateDashboard(); // Refresh dashboard
            }
            
            showToast('Firmware', `Firmware de referência atualizado: ${selectedValue}`, 'success', 3000);
        } catch (error) {
            console.error('❌ Erro ao selecionar firmware:', error);
            showToast('Erro', error.message, 'error');
            firmwareSelect.value = '';
        }
    } else {
        hideCurrentFirmwareDisplay();
    }
}

function showCustomFirmwareInput() {
    customFirmwareInput.classList.remove('hidden');
    newFirmwareVersion.focus();
    newFirmwareVersion.value = '';
}

function hideCustomFirmwareInput() {
    customFirmwareInput.classList.add('hidden');
    newFirmwareVersion.value = '';
}

function handleAddFirmware() {
    const firmwareValue = newFirmwareVersion.value.trim();
    
    if (!firmwareValue) {
        showToast('Erro', 'Por favor, digite uma versão de firmware', 'error');
        return;
    }
    
    try {
        firmwareManager.addCustomFirmware(firmwareValue);
        populateFirmwareDropdown();
        
        // Set as reference
        firmwareManager.setReferenceFirmware(firmwareValue);
        firmwareSelect.value = firmwareValue;
        updateCurrentFirmwareDisplay(firmwareValue);
        hideCustomFirmwareInput();
        
        // Update results if they exist
        if (deviceResults.length > 0) {
            updateResultsWithFirmwareComparison();
            generateDashboard();
        }
        
        showToast('Sucesso', `Firmware adicionado e definido como referência: ${firmwareValue}`, 'success');
    } catch (error) {
        showToast('Erro', error.message, 'error');
        newFirmwareVersion.focus();
    }
}

function handleCancelFirmware() {
    hideCustomFirmwareInput();
    firmwareSelect.value = firmwareManager.getReferenceFirmware() || '';
}

function handleRefreshFirmware() {
    populateFirmwareDropdown();
    showToast('Firmware', 'Lista de firmware atualizada', 'success', 2000);
}

function handleFirmwareInput(event) {
    const value = event.target.value;
    const isValid = firmwareManager.isValidFirmwareFormat(value);
    
    // Visual feedback for validation
    if (value.length > 0) {
        if (isValid) {
            newFirmwareVersion.style.borderColor = '#48bb78';
            addFirmwareBtn.disabled = false;
        } else {
            newFirmwareVersion.style.borderColor = '#e53e3e';
            addFirmwareBtn.disabled = true;
        }
    } else {
        newFirmwareVersion.style.borderColor = '#e2e8f0';
        addFirmwareBtn.disabled = true;
    }
}

function updateCurrentFirmwareDisplay(firmware) {
    if (firmware) {
        selectedFirmwareText.textContent = firmware;
        currentFirmwareDisplay.classList.remove('hidden');
    } else {
        hideCurrentFirmwareDisplay();
    }
}

function hideCurrentFirmwareDisplay() {
    currentFirmwareDisplay.classList.add('hidden');
    selectedFirmwareText.textContent = 'Nenhum selecionado';
}

function updateResultsWithFirmwareComparison() {
    if (!firmwareManager || !deviceResults.length) return;
    
    const referenceFirmware = firmwareManager.getReferenceFirmware();
    if (!referenceFirmware) return;
    
    // Update results with firmware comparison
    deviceResults.forEach(device => {
        const comparison = firmwareManager.compareFirmware(device.version || device.firmware, referenceFirmware);
        device.firmwareComparison = comparison;
    });
    
    // Re-render results
    renderResults();
    updateResultsSummary();
    
    console.log('✅ Resultados atualizados com comparação de firmware');
}

function generateFirmwareStatusBadge(comparison) {
    if (!comparison) {
        return '<span class="firmware-status unknown"><i class="fas fa-question"></i> Desconhecido</span>';
    }
    
    const statusIcons = {
        'updated': 'fas fa-check',
        'outdated': 'fas fa-exclamation-triangle', 
        'newer': 'fas fa-arrow-up',
        'unknown': 'fas fa-question'
    };
    
    const statusClasses = {
        'updated': 'updated',
        'outdated': 'outdated',
        'newer': 'updated', // Treat newer as good
        'unknown': 'unknown'
    };
    
    const icon = statusIcons[comparison.status] || 'fas fa-question';
    const className = statusClasses[comparison.status] || 'unknown';
    const message = comparison.message || 'Status desconhecido';
    
    let badge = `<span class="firmware-status ${className}">`;
    badge += `<i class="${icon}"></i> ${message}`;
    badge += '</span>';
    
    // Add priority indicator for outdated firmware
    if (comparison.status === 'outdated' && comparison.priority) {
        const priorityTexts = {
            'high': 'CRÍTICO',
            'medium': 'IMPORTANTE', 
            'low': 'BAIXO'
        };
        
        badge += `<span class="update-priority ${comparison.priority}">`;
        badge += `<i class="fas fa-flag"></i> ${priorityTexts[comparison.priority]}`;
        badge += '</span>';
    }
    
    return badge;
}

function generateFirmwareComparisonDetails(comparison) {
    if (!comparison || !comparison.comparison) {
        return '<p>Informações de comparação não disponíveis</p>';
    }
    
    const { current, reference } = comparison.comparison;
    
    let details = '<div class="firmware-comparison">';
    details += '<div class="firmware-comparison-title">Comparação de Firmware:</div>';
    details += '<div class="firmware-versions">';
    details += `<div class="firmware-current">Atual: ${current.original}</div>`;
    details += `<div class="firmware-reference">Referência: ${reference.original}</div>`;
    details += '</div>';
    
    if (comparison.comparison.versionDiff !== undefined) {
        const diff = comparison.comparison.versionDiff;
        details += `<div class="version-diff">Diferença de versão: ${diff > 0 ? '+' : ''}${diff}</div>`;
    }
    
    if (comparison.comparison.dateDiff !== undefined) {
        const days = Math.round(comparison.comparison.dateDiff);
        details += `<div class="date-diff">Diferença de build: ${days} dias</div>`;
    }
    
    details += '</div>';
    
    return details;
}

} // End of allcomAppInitialized check
