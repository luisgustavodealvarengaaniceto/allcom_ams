// Prevent multiple initialization
if (window.allcomAppInitialized) {
    console.log('⚠️ Allcom App já inicializado, evitando duplicação');
} else {
    window.allcomAppInitialized = true;

// API Configuration
const API_CONFIG = {
    endpoint: 'http://fota-api.jimicloud.com', // HTTPS para produção
    proxyEndpoint: '/api',
    appKey: 'Jimiiotbrasil',
    secret: '23dd6cca658b4ec298aeb7beb4972fd4',
    maxBatchSize: 15 // Reduzido de 99 para 15 devido a limite da API JimiCloud
};

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
    console.log('🚀 DOM carregado, inicializando app...');
    
    // Check initial modal state
    const initialModal = document.getElementById('deviceModal');
    console.log('🔍 Estado inicial do modal:', {
        exists: !!initialModal,
        classes: initialModal ? Array.from(initialModal.classList) : 'N/A',
        isHidden: initialModal ? initialModal.classList.contains('hidden') : 'N/A'
    });
    
    initializeManagers();
    setupEventListeners();
    updateImeiCount();
});

// Initialize all managers
function initializeManagers() {
    try {
        // Check if all required classes are available
        if (typeof CacheManager === 'undefined') {
            console.error('❌ CacheManager not loaded');
            setTimeout(initializeManagers, 100);
            return;
        }
        
        if (typeof PerformanceManager === 'undefined') {
            console.error('❌ PerformanceManager not loaded');
            setTimeout(initializeManagers, 100);
            return;
        }
        
        if (typeof DashboardManager === 'undefined') {
            console.error('❌ DashboardManager not loaded');
            setTimeout(initializeManagers, 100);
            return;
        }
        
        if (typeof ExportManager === 'undefined') {
            console.error('❌ ExportManager not loaded');
            setTimeout(initializeManagers, 100);
            return;
        }
        
        if (typeof FirmwareManager === 'undefined') {
            console.error('❌ FirmwareManager not loaded');
            setTimeout(initializeManagers, 100);
            return;
        }
        
        // Avoid re-initialization if already done
        if (window.cacheManager && cacheManager) {
            console.log('⚠️ Managers already initialized, skipping...');
            return;
        }
        
        // Initialize managers in correct order
        console.log('🔄 Inicializando managers...');
        
        window.cacheManager = cacheManager = new CacheManager();
        console.log('✅ CacheManager inicializado');
        
        window.performanceManager = performanceManager = new PerformanceManager();
        console.log('✅ PerformanceManager inicializado');
        
        window.dashboardManager = dashboardManager = new DashboardManager();
        console.log('✅ DashboardManager inicializado');
        
        window.exportManager = exportManager = new ExportManager();
        console.log('✅ ExportManager inicializado');
        
        window.firmwareManager = firmwareManager = new FirmwareManager();
        console.log('✅ FirmwareManager inicializado');
        
        console.log('✅ Todos os managers criados e expostos globalmente');
        
        // Wait a tick for managers to be fully ready
        setTimeout(() => {
            try {
                // Load user preferences
                loadUserPreferences();
                setupPreferencesAutoSave();
                
                // Initialize firmware interface
                initializeFirmwareInterface();
                
                console.log('✅ Sistema completamente inicializado com firmware management');
                
                // Ensure modal is hidden on startup
                const modal = document.getElementById('deviceModal');
                if (modal && !modal.classList.contains('hidden')) {
                    console.log('⚠️ Modal estava visível, forçando esconder...');
                    modal.classList.add('hidden');
                }
                console.log('🔍 Estado final do modal:', {
                    exists: !!modal,
                    classes: modal ? Array.from(modal.classList) : 'N/A',
                    isHidden: modal ? modal.classList.contains('hidden') : 'N/A'
                });
            } catch (error) {
                console.error('❌ Erro na inicialização final:', error);
            }
        }, 50);
        
        console.log('✅ All managers initialized successfully with firmware management');
    } catch (error) {
        console.error('❌ Error initializing managers:', error);
        try {
            showToast('Erro ao inicializar sistema', 'error');
        } catch (toastError) {
            console.error('Toast also failed:', toastError);
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
                console.warn(`Linha ${index + 1}: IMEI inválido "${line.trim()}"`);
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
    
    showToast('Arquivo Carregado', message, validCount > 0 ? 'success' : 'warning');
    
    // Clear file input
    fileInput.value = '';
}

// Main consultation handler with debounce protection
let isConsulting = false;
let lastConsultTime = 0;
const CONSULT_DEBOUNCE_TIME = 3000; // 3 seconds between requests

async function handleConsultar() {
    // Prevent rapid multiple clicks
    const now = Date.now();
    if (isConsulting) {
        showToast('Aviso', 'Uma consulta já está em andamento. Aguarde a conclusão.', 'warning');
        return;
    }
    
    if (now - lastConsultTime < CONSULT_DEBOUNCE_TIME) {
        const remainingTime = Math.ceil((CONSULT_DEBOUNCE_TIME - (now - lastConsultTime)) / 1000);
        showToast('Aviso', `Aguarde ${remainingTime} segundos antes de fazer uma nova consulta.`, 'warning');
        return;
    }

    const imeis = getValidImeis();
    
    if (imeis.length === 0) {
        showToast('Erro', 'Por favor, insira pelo menos um IMEI válido.', 'error');
        return;
    }

    // Check circuit breaker status before starting
    if (performanceManager && !performanceManager.canMakeRequest()) {
        const circuitState = performanceManager.getCircuitBreakerState();
        showToast('Sistema Indisponível', 'Sistema temporariamente indisponível devido a muitos erros. Aguarde alguns minutos antes de tentar novamente.', 'error');
        console.log('Circuit breaker state:', circuitState);
        return;
    }

    isConsulting = true;
    lastConsultTime = now;
    consultarBtn.disabled = true;
    consultarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Consultando...';

    const batchCount = Math.ceil(imeis.length / API_CONFIG.maxBatchSize);
    const confirmMessage = imeis.length > API_CONFIG.maxBatchSize 
        ? `Você está prestes a consultar ${imeis.length} IMEIs em ${batchCount} lotes. Isso pode levar alguns minutos. Deseja continuar?`
        : `Consultar status de ${imeis.length} equipamento${imeis.length > 1 ? 's' : ''}?`;
    
    if (imeis.length > 200 && !confirm(confirmMessage)) {
        resetConsultButton();
        return;
    }

    showLoading();
    hideResults();
    
    try {
        deviceResults = [];
        const batches = createBatches(imeis, API_CONFIG.maxBatchSize);
        let processedCount = 0;
        let successfulBatches = 0;
        let failedBatches = 0;
        
        // Track individual processing statistics
        const individualStats = {
            attempted: 0,
            recovered: 0
        };
        
        showToast('Iniciando', `Processando ${imeis.length} IMEIs em ${batches.length} lote${batches.length > 1 ? 's' : ''}`, 'info');
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const progress = ((i) / batches.length) * 100;
            
            updateProgress(progress, `Processando lote ${i + 1} de ${batches.length} (${batch.length} IMEIs)...`);
            
            try {
                const batchResults = await queryDeviceStatusWithPerformance(batch);
                
                // Identificar IMEIs que foram processados com sucesso
                const processedImeis = new Set(batchResults.map(result => result.imei));
                const failedImeis = batch.filter(imei => !processedImeis.has(imei));
                
                // Sempre adicionar resultados, mesmo que parciais
                if (batchResults && batchResults.length > 0) {
                    deviceResults.push(...batchResults);
                    console.log(`[Lote ${i + 1}] Adicionados ${batchResults.length} resultados de ${batch.length} solicitados`);
                } else {
                    console.warn(`[Lote ${i + 1}] Nenhum resultado retornado para ${batch.length} IMEIs`);
                }
                
                // Se há IMEIs que falharam no lote, tentar processá-los individualmente
                if (failedImeis.length > 0 && failedImeis.length < batch.length) {
                    console.log(`[Lote ${i + 1}] Tentando reprocessar ${failedImeis.length} IMEIs individualmente:`, failedImeis);
                    showToast('Reprocessando', `Reprocessando ${failedImeis.length} IMEIs individualmente...`, 'info');
                    
                    individualStats.attempted += failedImeis.length;
                    const individualResults = await processIndividualImeis(failedImeis, i + 1);
                    if (individualResults.length > 0) {
                        deviceResults.push(...individualResults);
                        individualStats.recovered += individualResults.length;
                        console.log(`[Lote ${i + 1}] Recuperados ${individualResults.length} IMEIs no reprocessamento individual`);
                        showToast('Recuperados', `${individualResults.length} IMEIs recuperados no reprocessamento!`, 'success');
                    }
                }
                
                processedCount += batch.length;
                successfulBatches++;
                
                // Update progress after each batch
                const progressAfterBatch = ((i + 1) / batches.length) * 100;
                updateProgress(progressAfterBatch, `Lote ${i + 1}/${batches.length} concluído (${deviceResults.length} resultados de ${processedCount} IMEIs processados)`);
                
            } catch (error) {
                console.error(`Erro no lote ${i + 1}:`, error);
                failedBatches++;
                
                // Tentar recuperar resultados parciais mesmo com erro
                if (error.partialResults && error.partialResults.length > 0) {
                    deviceResults.push(...error.partialResults);
                    console.log(`[Lote ${i + 1}] Recuperados ${error.partialResults.length} resultados parciais após erro`);
                    showToast('Parcial', `Lote ${i + 1}: Erro, mas ${error.partialResults.length} resultados foram recuperados`, 'warning');
                } else {
                    // Tentar processar todos os IMEIs do lote individualmente em caso de erro completo
                    console.log(`[Lote ${i + 1}] Erro completo, tentando processar ${batch.length} IMEIs individualmente...`);
                    showToast('Erro no Lote', `Erro no lote ${i + 1}, tentando processar IMEIs individualmente...`, 'warning');
                    
                    try {
                        individualStats.attempted += batch.length;
                        const individualResults = await processIndividualImeis(batch, i + 1);
                        if (individualResults.length > 0) {
                            deviceResults.push(...individualResults);
                            individualStats.recovered += individualResults.length;
                            console.log(`[Lote ${i + 1}] Recuperados ${individualResults.length} IMEIs através de processamento individual`);
                            showToast('Recuperação', `${individualResults.length} IMEIs recuperados através de processamento individual!`, 'success');
                        }
                    } catch (individualError) {
                        console.error(`[Lote ${i + 1}] Erro também no processamento individual:`, individualError);
                        
                        // More specific error handling
                        if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
                            showToast('Erro do Servidor', `Lote ${i + 1}: Servidor da API temporariamente indisponível. Tentando continuar...`, 'warning');
                        } else if (error.message.includes('timeout')) {
                            showToast('Timeout', `Lote ${i + 1}: Timeout na requisição. Tentando continuar...`, 'warning');
                        } else if (error.message.includes('Circuit breaker')) {
                            showToast('Sistema Pausado', 'Sistema pausado devido a muitos erros. Interrompendo consulta.', 'error');
                            break; // Stop processing if circuit breaker opens
                        } else {
                            showToast('Aviso', `Erro no lote ${i + 1}: ${error.message}`, 'warning');
                        }
                    }
                }
                
                processedCount += batch.length; // Contar como processados mesmo com erro
                
                // Continue with remaining batches even if one fails
                continue;
            }
            
            // Progressive delay to avoid overwhelming the API
            if (i < batches.length - 1) {
                const delay = batches.length > 5 ? 2000 : 1000; // Longer delay for many batches and after errors
                if (failedBatches > 0) {
                    const extraDelay = failedBatches * 1000; // Extra delay if there were errors
                    await new Promise(resolve => setTimeout(resolve, delay + extraDelay));
                } else {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        updateProgress(100, `Processamento concluído! ${deviceResults.length} equipamentos processados de ${imeis.length} solicitados.`);
        
        // Process results
        processResults();
        
        // Gerar relatório detalhado de processamento
        generateProcessingReport(imeis, deviceResults, failedBatches, individualStats);
        
        // Mostrar botão do relatório
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.style.display = 'inline-flex';
        }
        
        // Show summary
        const successCount = deviceResults.length;
        const failedCount = imeis.length - successCount;
        
        let summaryMessage = `Consulta concluída! ${successCount} equipamentos processados com sucesso.`;
        if (failedCount > 0) {
            summaryMessage += ` ${failedCount} não foram encontrados.`;
        }
        if (failedBatches > 0) {
            summaryMessage += ` ${failedBatches} lotes falharam.`;
        }
        
        // Hide loading and show results
        setTimeout(() => {
            hideLoading();
            showResults();
        }, 1000);
        
        showToast('Sucesso', summaryMessage, successCount > 0 ? 'success' : 'warning');
        
    } catch (error) {
        console.error('Erro na consulta:', error);
        hideLoading();
        showToast('Erro', `Erro durante a consulta: ${error.message}`, 'error');
    } finally {
        // Always reset the consultation state
        resetConsultButton();
    }
}

// Reset consultation button and state
function resetConsultButton() {
    isConsulting = false;
    consultarBtn.disabled = false;
    consultarBtn.innerHTML = '<i class="fas fa-search"></i> Consultar Status';
}

// Create batches of IMEIs
function createBatches(imeis, batchSize) {
    const batches = [];
    const totalImeis = imeis.length;
    
    console.log(`Criando lotes para ${totalImeis} IMEIs com tamanho máximo de ${batchSize} por lote`);
    
    for (let i = 0; i < totalImeis; i += batchSize) {
        const batch = imeis.slice(i, i + batchSize);
        batches.push(batch);
        console.log(`Lote ${batches.length}: ${batch.length} IMEIs (${i + 1}-${Math.min(i + batch.length, totalImeis)})`);
    }
    
    console.log(`Total de ${batches.length} lotes criados`);
    return batches;
}

// Query device status from API with CORS handling
async function queryDeviceStatus(imeiList, retries = 2) {
    const batchId = Math.random().toString(36).substr(2, 9);
    console.log(`[${batchId}] Consultando ${imeiList.length} IMEIs:`, imeiList.slice(0, 3).join(', ') + (imeiList.length > 3 ? '...' : ''));
    
    let partialResults = [];
    let lastError = null;
    
    // First try to use local proxy server
    try {
        console.log(`[${batchId}] Tentando usar servidor proxy local...`);
        const results = await queryWithProxy(imeiList, batchId);
        console.log(`[${batchId}] Sucesso via proxy: ${results.length} resultados retornados`);
        return results;
    } catch (proxyError) {
        console.log(`[${batchId}] Proxy indisponível, tentando acesso direto:`, proxyError.message);
        lastError = proxyError;
    }
    
    // Fallback to direct API access
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const authData = await getAuthToken();
            
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
            
            console.log(`[${batchId}] Tentativa ${attempt} - acesso direto à API`);
            const response = await fetch(`${API_CONFIG.endpoint}/queryDeviceStatus`, requestOptions);
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            const results = parseApiResponse(data, batchId);
            
            console.log(`[${batchId}] Sucesso direto: ${results.length} resultados retornados de ${imeiList.length} solicitados`);
            
            // Log IMEIs que não retornaram dados
            if (results.length < imeiList.length) {
                const returnedImeis = results.map(r => r.imei);
                const missingImeis = imeiList.filter(imei => !returnedImeis.includes(imei));
                console.warn(`[${batchId}] IMEIs não encontrados na resposta (${missingImeis.length}):`, missingImeis);
            }
            
            return results;
            
        } catch (error) {
            console.error(`[${batchId}] Tentativa ${attempt} falhou:`, error.message);
            lastError = error;
            
            if (error.name === 'AbortError') {
                console.error(`[${batchId}] Timeout na requisição`);
                if (attempt <= retries) {
                    console.log(`[${batchId}] Tentando novamente em 2 segundos...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
            }
            
            if (error.name === 'TypeError' && 
                (error.message.includes('fetch') || 
                 error.message.includes('Failed to fetch') ||
                 error.message.includes('CORS'))) {
                
                if (attempt <= retries) {
                    console.log(`[${batchId}] Tentando novamente devido a erro de rede/CORS...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
            }
            
            // For HTTP errors or other errors, retry with exponential backoff
            if (attempt <= retries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
                console.log(`[${batchId}] Aguardando ${delay}ms antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
        }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    // Criar erro personalizado com resultados parciais se houver
    const errorWithPartial = new Error(lastError?.message || 'Falha em todas as tentativas de consulta');
    if (partialResults.length > 0) {
        errorWithPartial.partialResults = partialResults;
        console.log(`[${batchId}] Retornando ${partialResults.length} resultados parciais devido a erro`);
    }
    
    throw errorWithPartial;
}

// Query using local proxy server
async function queryWithProxy(imeiList, batchId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for proxy
    
    try {
        const response = await fetch(`${API_CONFIG.proxyEndpoint}/queryDeviceStatus`, {
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
    
    console.log(`[${batchId}] Parseando resposta da API:`, typeof data, Array.isArray(data) ? `Array com ${data.length} itens` : 'Objeto');
    
    try {
        if (Array.isArray(data)) {
            results = data;
            console.log(`[${batchId}] Dados já são array com ${results.length} itens`);
        } else if (data && Array.isArray(data.data)) {
            results = data.data;
            console.log(`[${batchId}] Dados encontrados em data.data com ${results.length} itens`);
        } else if (data && data.result && Array.isArray(data.result)) {
            results = data.result;
            console.log(`[${batchId}] Dados encontrados em data.result com ${results.length} itens`);
        } else if (data && data.devices && Array.isArray(data.devices)) {
            results = data.devices;
            console.log(`[${batchId}] Dados encontrados em data.devices com ${results.length} itens`);
        } else if (data && data.success !== false) {
            // Tentar encontrar qualquer array no objeto de resposta
            console.log(`[${batchId}] Tentando encontrar arrays na resposta...`);
            for (const key in data) {
                if (Array.isArray(data[key])) {
                    console.log(`[${batchId}] Array encontrado em ${key} com ${data[key].length} itens`);
                    results = data[key];
                    break;
                }
            }
            
            if (results.length === 0) {
                console.log(`[${batchId}] Nenhum array encontrado, resposta inesperada:`, Object.keys(data || {}));
                results = [];
            }
        } else {
            console.error(`[${batchId}] Resposta indica erro:`, data);
            throw new Error(data.message || 'Formato de resposta inválido da API');
        }
        
        // Validar que todos os itens têm pelo menos um IMEI
        const validResults = results.filter(item => {
            if (!item || typeof item !== 'object') {
                console.warn(`[${batchId}] Item inválido encontrado:`, item);
                return false;
            }
            if (!item.imei) {
                console.warn(`[${batchId}] Item sem IMEI encontrado:`, item);
                return false;
            }
            return true;
        });
        
        if (validResults.length !== results.length) {
            console.warn(`[${batchId}] ${results.length - validResults.length} itens inválidos foram filtrados`);
        }
        
        console.log(`[${batchId}] Parse finalizado: ${validResults.length} resultados válidos`);
        return validResults;
        
    } catch (error) {
        console.error(`[${batchId}] Erro no parse da resposta:`, error);
        console.error(`[${batchId}] Dados originais:`, data);
        return []; // Retornar array vazio em vez de quebrar tudo
    }
}

// Get authentication token
async function getAuthToken() {
    try {
        // For JimiCloud API, generate MD5 signature
        const timestamp = Date.now();
        const signString = `${API_CONFIG.appKey}${timestamp}${API_CONFIG.secret}`;
        
        // Simple MD5 implementation for browser
        const sign = await generateMD5(signString);
        
        return {
            appkey: API_CONFIG.appKey,
            timestamp: timestamp.toString(),
            sign: sign
        };
    } catch (error) {
        throw new Error('Erro ao gerar token de autenticação');
    }
}

// Simple MD5 hash function (vanilla JS, blueimp style)
function generateMD5(str) {
    // https://github.com/blueimp/JavaScript-MD5 (compact version)
    function safeAdd(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    function bitRotateLeft(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    function md5cmn(q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
    }
    function md5ff(a, b, c, d, x, s, t) {
        return md5cmn((b & c) | (~b & d), a, b, x, s, t);
    }
    function md5gg(a, b, c, d, x, s, t) {
        return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
    }
    function md5hh(a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5ii(a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | ~d), a, b, x, s, t);
    }
    function binlMD5(x, len) {
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var i, olda, oldb, oldc, oldd;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;
            a = md5ff(a, b, c, d, x[i], 7, -680876936);
            d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5gg(b, c, d, a, x[i], 20, -373897302);
            a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5hh(d, a, b, c, x[i], 11, -358537222);
            c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = md5ii(a, b, c, d, x[i], 6, -198630844);
            d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = safeAdd(a, olda);
            b = safeAdd(b, oldb);
            c = safeAdd(c, oldc);
            d = safeAdd(d, oldd);
        }
        return [a, b, c, d];
    }
    function binl2rstr(input) {
        var i, output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }
    function rstr2binl(input) {
        var i, output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }
    function rstrMD5(s) {
        return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
    }
    function rstr2hex(input) {
        var hexTab = '0123456789abcdef', output = '', x, i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hexTab.charAt((x >>> 4) & 0x0F) + hexTab.charAt(x & 0x0F);
        }
        return output;
    }
    function str2rstrUTF8(input) {
        return unescape(encodeURIComponent(input));
    }
    return rstr2hex(rstrMD5(str2rstrUTF8(str)));
}

// Gerar relatório detalhado de processamento
function generateProcessingReport(requestedImeis, processedResults, failedBatches, individualProcessingStats = {}) {
    const processedImeis = processedResults.map(device => device.imei);
    const missingImeis = requestedImeis.filter(imei => !processedImeis.includes(imei));
    
    console.log('\n📊 RELATÓRIO DE PROCESSAMENTO:');
    console.log(`   Total solicitado: ${requestedImeis.length} IMEIs`);
    console.log(`   Processados com sucesso: ${processedImeis.length} IMEIs`);
    console.log(`   Não encontrados/falharam: ${missingImeis.length} IMEIs`);
    console.log(`   Lotes com falha: ${failedBatches}`);
    console.log(`   Taxa de sucesso: ${Math.round((processedImeis.length / requestedImeis.length) * 100)}%`);
    
    // Mostrar estatísticas de processamento individual se disponível
    if (individualProcessingStats.attempted > 0) {
        console.log('\n🔄 PROCESSAMENTO INDIVIDUAL:');
        console.log(`   IMEIs tentados individualmente: ${individualProcessingStats.attempted}`);
        console.log(`   Recuperados com sucesso: ${individualProcessingStats.recovered}`);
        console.log(`   Taxa de recuperação: ${Math.round((individualProcessingStats.recovered / individualProcessingStats.attempted) * 100)}%`);
    }
    
    if (missingImeis.length > 0) {
        console.log('\n❌ IMEIs não processados:');
        missingImeis.forEach((imei, index) => {
            console.log(`   ${index + 1}. ${imei}`);
        });
        
        // Verificar padrões nos IMEIs que falharam
        const failedPatterns = {};
        missingImeis.forEach(imei => {
            const prefix = imei.substring(0, 6);
            failedPatterns[prefix] = (failedPatterns[prefix] || 0) + 1;
        });
        
        if (Object.keys(failedPatterns).length > 1) {
            console.log('\n🔍 Padrões nos IMEIs não processados:');
            Object.entries(failedPatterns).forEach(([prefix, count]) => {
                console.log(`   ${prefix}***: ${count} IMEIs`);
            });
        }
        
        // Sugestão para o usuário
        if (missingImeis.length > 0) {
            console.log('\n💡 SUGESTÃO:');
            console.log('   Tente processar os IMEIs não encontrados individualmente na interface.');
            console.log('   Alguns IMEIs podem estar temporariamente indisponíveis na API.');
            
            // Mostrar botão para reprocessar IMEIs falhados
            showRetryFailedButton(missingImeis);
        }
    }
    
    if (processedImeis.length > 0) {
        console.log('\n✅ IMEIs processados com sucesso:');
        processedImeis.slice(0, 10).forEach((imei, index) => {
            console.log(`   ${index + 1}. ${imei}`);
        });
        if (processedImeis.length > 10) {
            console.log(`   ... e mais ${processedImeis.length - 10} IMEIs`);
        }
    }
    
    // Salvar relatório no sessionStorage para possível exportação
    const report = {
        timestamp: new Date().toISOString(),
        requested: requestedImeis,
        processed: processedImeis,
        missing: missingImeis,
        failedBatches: failedBatches,
        successRate: Math.round((processedImeis.length / requestedImeis.length) * 100),
        individualProcessing: individualProcessingStats
    };
    
    try {
        sessionStorage.setItem('lastProcessingReport', JSON.stringify(report));
    } catch (e) {
        console.warn('Não foi possível salvar relatório no sessionStorage:', e);
    }
}

// Show button to retry failed IMEIs
function showRetryFailedButton(failedImeis) {
    // Find or create the retry button container
    let retryContainer = document.getElementById('retryFailedContainer');
    if (!retryContainer) {
        retryContainer = document.createElement('div');
        retryContainer.id = 'retryFailedContainer';
        retryContainer.className = 'retry-container';
        retryContainer.innerHTML = `
            <div class="retry-info">
                <h4><i class="fas fa-exclamation-triangle"></i> IMEIs Não Processados</h4>
                <p>${failedImeis.length} IMEIs não foram encontrados no processamento em lote.</p>
                <button id="retryFailedBtn" class="btn btn-warning">
                    <i class="fas fa-redo"></i> Tentar Novamente (Individual)
                </button>
                <button id="copyFailedBtn" class="btn btn-secondary">
                    <i class="fas fa-copy"></i> Copiar Lista
                </button>
            </div>
        `;
        
        // Add after results section
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.appendChild(retryContainer);
        }
    } else {
        // Update existing container
        const infoText = retryContainer.querySelector('.retry-info p');
        if (infoText) {
            infoText.textContent = `${failedImeis.length} IMEIs não foram encontrados no processamento em lote.`;
        }
    }
    
    // Add event listeners
    const retryBtn = document.getElementById('retryFailedBtn');
    const copyBtn = document.getElementById('copyFailedBtn');
    
    if (retryBtn) {
        retryBtn.onclick = () => retryFailedImeis(failedImeis);
    }
    
    if (copyBtn) {
        copyBtn.onclick = () => copyFailedImeis(failedImeis);
    }
}

// Retry failed IMEIs individually
async function retryFailedImeis(failedImeis) {
    if (!failedImeis || failedImeis.length === 0) {
        showToast('Aviso', 'Nenhum IMEI para reprocessar', 'warning');
        return;
    }
    
    console.log(`🔄 Iniciando reprocessamento de ${failedImeis.length} IMEIs falhados...`);
    showToast('Reprocessando', `Tentando reprocessar ${failedImeis.length} IMEIs individualmente...`, 'info');
    
    // Disable the retry button to prevent double-clicking
    const retryBtn = document.getElementById('retryFailedBtn');
    if (retryBtn) {
        retryBtn.disabled = true;
        retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    }
    
    try {
        const recoveredResults = await processIndividualImeis(failedImeis, 'Retry');
        
        if (recoveredResults.length > 0) {
            // Add recovered results to existing results
            deviceResults.push(...recoveredResults);
            
            // Process the new results
            recoveredResults.forEach(device => {
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
            
            // Update the display
            displayResults(deviceResults);
            
            // Update firmware comparison
            if (typeof updateFirmwareComparison === 'function') {
                updateFirmwareComparison();
            }
            
            console.log(`✅ Reprocessamento concluído: ${recoveredResults.length}/${failedImeis.length} IMEIs recuperados`);
            showToast('Sucesso', `${recoveredResults.length} IMEIs recuperados no reprocessamento!`, 'success');
            
            // Update the retry button info
            const stillFailedImeis = failedImeis.filter(imei => 
                !recoveredResults.some(result => result.imei === imei)
            );
            
            if (stillFailedImeis.length > 0) {
                showRetryFailedButton(stillFailedImeis);
            } else {
                // Hide retry container if all IMEIs were recovered
                const retryContainer = document.getElementById('retryFailedContainer');
                if (retryContainer) {
                    retryContainer.style.display = 'none';
                }
            }
        } else {
            console.log('❌ Nenhum IMEI foi recuperado no reprocessamento');
            showToast('Sem Sucesso', 'Nenhum IMEI adicional foi encontrado', 'warning');
        }
    } catch (error) {
        console.error('Erro no reprocessamento:', error);
        showToast('Erro', 'Erro no reprocessamento: ' + error.message, 'error');
    } finally {
        // Re-enable the retry button
        if (retryBtn) {
            retryBtn.disabled = false;
            retryBtn.innerHTML = '<i class="fas fa-redo"></i> Tentar Novamente (Individual)';
        }
    }
}

// Copy failed IMEIs to clipboard
async function copyFailedImeis(failedImeis) {
    try {
        const text = failedImeis.join('\n');
        await navigator.clipboard.writeText(text);
        showToast('Copiado', `${failedImeis.length} IMEIs copiados para a área de transferência`, 'success');
    } catch (error) {
        console.error('Erro ao copiar:', error);
        showToast('Erro', 'Erro ao copiar IMEIs', 'error');
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
                    console.log(`🔍 Firmware encontrado em '${key}':`, value);
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
            console.log(`✅ Firmware encontrado via busca robusta:`, foundFirmware);
            return foundFirmware;
        }
        
    } catch (error) {
        console.warn('⚠️ Erro na busca robusta de firmware:', error);
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
        console.error('Erro ao processar data:', error);
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

// Mostrar relatório de processamento detalhado
function showProcessingReport() {
    try {
        const reportData = sessionStorage.getItem('lastProcessingReport');
        if (!reportData) {
            showToast('Aviso', 'Nenhum relatório de processamento disponível.', 'warning');
            return;
        }
        
        const report = JSON.parse(reportData);
        const reportTime = new Date(report.timestamp).toLocaleString('pt-BR');
        
        let reportHtml = `
            <div class="processing-report">
                <h3><i class="fas fa-chart-bar"></i> Relatório de Processamento</h3>
                <p class="report-timestamp">Gerado em: ${reportTime}</p>
                
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="label">Total solicitado:</span>
                        <span class="value">${report.requested.length} IMEIs</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Processados:</span>
                        <span class="value success">${report.processed.length} IMEIs</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Não encontrados:</span>
                        <span class="value error">${report.missing.length} IMEIs</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Taxa de sucesso:</span>
                        <span class="value">${report.successRate}%</span>
                    </div>
                </div>
        `;
        
        if (report.missing.length > 0) {
            reportHtml += `
                <div class="missing-imeis">
                    <h4><i class="fas fa-exclamation-triangle"></i> IMEIs não processados:</h4>
                    <div class="imei-list">
                        ${report.missing.map(imei => `<span class="imei-item">${imei}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        reportHtml += `</div>`;
        
        // Mostrar em modal
        showModal('Relatório de Processamento', reportHtml);
        
    } catch (error) {
        console.error('Erro ao mostrar relatório:', error);
        showToast('Erro', 'Erro ao carregar relatório de processamento.', 'error');
    }
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
    console.log('🔍 Mostrando detalhes do dispositivo:', imei);
    
    const device = deviceResults.find(d => d.imei === imei);
    if (!device) {
        console.log('❌ Dispositivo não encontrado:', imei);
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
    console.log('🚫 Escondendo modal');
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

// Process individual IMEIs when batch processing fails
async function processIndividualImeis(imeis, batchNumber) {
    const results = [];
    const maxConcurrent = 3; // Process max 3 at once to avoid overwhelming API
    
    console.log(`[Lote ${batchNumber}] Iniciando processamento individual de ${imeis.length} IMEIs`);
    
    // Process IMEIs in small groups to avoid overwhelming the API
    for (let i = 0; i < imeis.length; i += maxConcurrent) {
        const group = imeis.slice(i, i + maxConcurrent);
        const groupPromises = group.map(async (imei, index) => {
            try {
                // Wait a bit between individual requests
                if (index > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                console.log(`[Lote ${batchNumber}] Processando individualmente: ${imei}`);
                const result = await queryDeviceStatus([imei]); // Process as single item array
                
                if (result && result.length > 0) {
                    console.log(`[Lote ${batchNumber}] ✅ Sucesso individual: ${imei}`);
                    return result[0]; // Return the single result
                } else {
                    console.log(`[Lote ${batchNumber}] ❌ Não encontrado individual: ${imei}`);
                    return null;
                }
            } catch (error) {
                console.error(`[Lote ${batchNumber}] ❌ Erro individual ${imei}:`, error.message);
                return null;
            }
        });
        
        // Wait for this group to complete
        const groupResults = await Promise.all(groupPromises);
        
        // Add valid results
        groupResults.forEach(result => {
            if (result) {
                results.push(result);
            }
        });
        
        // Wait between groups
        if (i + maxConcurrent < imeis.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log(`[Lote ${batchNumber}] Processamento individual finalizado: ${results.length}/${imeis.length} sucessos`);
    return results;
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
