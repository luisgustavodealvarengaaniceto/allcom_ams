// Production Configuration - Remove Debug Logs
// Este script remove automaticamente console.log de produção

// Função para substituir logs por versão silenciosa
function createProductionLogger() {
    return {
        log: () => {},
        warn: () => {},
        error: console.error, // Manter apenas erros
        info: () => {},
        debug: () => {},
        trace: () => {},
        table: () => {},
        group: () => {},
        groupEnd: () => {},
        groupCollapsed: () => {},
        assert: () => {},
        count: () => {},
        countReset: () => {},
        time: () => {},
        timeEnd: () => {},
        timeLog: () => {},
        clear: () => {},
        dir: () => {},
        dirxml: () => {}
    };
}

// Em produção, substitua console por versão silenciosa
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    window.console = createProductionLogger();
}
