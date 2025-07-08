// Reset script para limpar cache e resolver conflitos
console.log('🧹 Iniciando limpeza do sistema...');

// Clear all existing variables
if (typeof window !== 'undefined') {
    // Clear existing managers
    window.cacheManager = undefined;
    window.performanceManager = undefined;
    window.dashboardManager = undefined;
    window.exportManager = undefined;
    window.firmwareManager = undefined;
    
    // Clear device data
    window.deviceResults = [];
    window.filteredResults = [];
    
    console.log('✅ Variáveis globais limpas');
}

// Clear localStorage cache
try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('allcom_')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`✅ Cache localStorage limpo (${keysToRemove.length} itens removidos)`);
} catch (error) {
    console.log('⚠️ Erro ao limpar localStorage:', error.message);
}

// Reset UI elements
try {
    // Hide modal if open
    const modal = document.getElementById('deviceModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Clear results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
    
    // Clear dashboard
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
        dashboardSection.classList.add('hidden');
    }
    
    // Reset firmware select
    const firmwareSelect = document.getElementById('firmwareSelect');
    if (firmwareSelect) {
        firmwareSelect.value = '';
    }
    
    // Hide firmware display
    const currentFirmwareDisplay = document.getElementById('currentFirmwareDisplay');
    if (currentFirmwareDisplay) {
        currentFirmwareDisplay.classList.add('hidden');
    }
    
    // Clear IMEI input
    const imeiInput = document.getElementById('imeiInput');
    if (imeiInput) {
        imeiInput.value = '';
    }
    
    console.log('✅ Interface resetada');
} catch (error) {
    console.log('⚠️ Erro ao resetar interface:', error.message);
}

// Function to force refresh page without cache
function forceRefresh() {
    console.log('🔄 Forçando refresh da página...');
    window.location.reload(true);
}

// Function to clear all caches
function clearAllCaches() {
    console.log('🧹 Limpando todos os caches...');
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Try to clear service worker caches
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                registration.unregister();
            });
        });
    }
    
    // Clear browser cache (if possible)
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
    
    console.log('✅ Todos os caches limpos');
    setTimeout(() => {
        window.location.reload(true);
    }, 1000);
}

// Export functions for manual use
window.resetSystem = {
    forceRefresh,
    clearAllCaches,
    clearLocalStorage: () => {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('allcom_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`✅ Cache Allcom limpo (${keysToRemove.length} itens)`);
    }
};

console.log('🔧 Sistema de reset carregado. Use window.resetSystem.* para funções manuais');
console.log('💡 Para resolver problemas, execute: window.resetSystem.clearAllCaches()');
