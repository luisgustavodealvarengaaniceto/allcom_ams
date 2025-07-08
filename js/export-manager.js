// Export Manager - Excel, CSV e JSON com formatação melhorada
class ExportManager {
    constructor() {
        this.exportFormats = ['csv', 'excel', 'json'];
    }

    // Exportar para CSV
    exportToCSV(devices, filename = 'equipamentos_allcom') {
        const headers = [
            'IMEI',
            'Status',
            'Firmware',
            'Última Comunicação',
            'Dias Offline',
            'Potência (V)',
            'Sinal CSQ',
            'ICCID',
            'Rede',
            'GPS',
            'ACC',
            'Temperatura CPU (°C)',
            'SD1 Status',
            'SD1 Usado (MB)',
            'SD1 Total (MB)',
            'SD1 Percentual Usado (%)',
            'SD2 Status', 
            'SD2 Usado (MB)',
            'SD2 Total (MB)',
            'SD2 Percentual Usado (%)',
            'Memória Interna Usado (MB)',
            'Memória Interna Total (MB)',
            'Memória Interna Percentual (%)',
            'Canal 1',
            'Canal 2',
            'Canal 3',
            'Canal 4',
            'Servidor',
            'Firmware Comparação',
            'Prioridade Atualização'
        ];

        const csvData = devices.map(device => [
            this.cleanText(device.imei || 'N/A'),
            device.isOnline ? 'Online' : 'Offline',
            this.cleanText(device.firmwareVersion || device.version || 'N/A'),
            this.cleanText(device.lastTimeBrasilia || 'N/A'),
            device.offlineDays || 0,
            this.extractVoltage(device),
            this.extractSignal(device),
            this.cleanText(device.iccid || 'N/A'),
            this.extractNetwork(device),
            this.extractGPS(device),
            this.extractACC(device),
            this.extractTemperature(device),
            this.getSDCardStatus(device.sdCardInfo?.sd1),
            this.getSDCardUsed(device.sdCardInfo?.sd1),
            this.getSDCardTotal(device.sdCardInfo?.sd1),
            this.getSDCardPercentage(device.sdCardInfo?.sd1),
            this.getSDCardStatus(device.sdCardInfo?.sd2),
            this.getSDCardUsed(device.sdCardInfo?.sd2),
            this.getSDCardTotal(device.sdCardInfo?.sd2),
            this.getSDCardPercentage(device.sdCardInfo?.sd2),
            this.getSDCardUsed(device.sdCardInfo?.memory),
            this.getSDCardTotal(device.sdCardInfo?.memory),
            this.getSDCardPercentage(device.sdCardInfo?.memory),
            this.getChannelStatus(device.systemInfo?.channels, 1),
            this.getChannelStatus(device.systemInfo?.channels, 2),
            this.getChannelStatus(device.systemInfo?.channels, 3),
            this.getChannelStatus(device.systemInfo?.channels, 4),
            this.cleanText(device.server || 'N/A'),
            this.getFirmwareComparisonText(device.firmwareComparison),
            this.getFirmwarePriority(device.firmwareComparison)
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    }

    // Exportar para Excel (usando SheetJS)
    async exportToExcel(devices, filename = 'equipamentos_allcom') {
        // Verificar se a biblioteca XLSX está disponível
        if (typeof XLSX === 'undefined') {
            showToast('Erro', 'Biblioteca XLSX não encontrada. Usando CSV como alternativa.', 'error');
            this.exportToCSV(devices, filename);
            return;
        }

        const workbook = XLSX.utils.book_new();
        
        // Aba principal com dados dos equipamentos
        const mainData = devices.map(device => ({
            'IMEI': device.imei || 'N/A',
            'Status': device.isOnline ? 'Online' : 'Offline',
            'Firmware': device.firmwareVersion || device.version || 'N/A',
            'Última Comunicação': device.lastTimeBrasilia || 'N/A',
            'Dias Offline': device.offlineDays || 0,
            'Potência (V)': this.extractVoltage(device),
            'Sinal (CSQ)': this.extractSignal(device),
            'ICCID': device.iccid || 'N/A',
            'Rede': this.extractNetwork(device),
            'GPS': this.extractGPS(device),
            'ACC': this.extractACC(device),
            'Temperatura CPU (°C)': this.extractTemperature(device),
            'SD1 Status': this.getSDCardStatus(device.sdCardInfo?.sd1),
            'SD1 Usado (MB)': this.getSDCardUsed(device.sdCardInfo?.sd1),
            'SD1 Total (MB)': this.getSDCardTotal(device.sdCardInfo?.sd1),
            'SD1 Percentual (%)': this.getSDCardPercentage(device.sdCardInfo?.sd1),
            'SD2 Status': this.getSDCardStatus(device.sdCardInfo?.sd2),
            'SD2 Usado (MB)': this.getSDCardUsed(device.sdCardInfo?.sd2),
            'SD2 Total (MB)': this.getSDCardTotal(device.sdCardInfo?.sd2),
            'SD2 Percentual (%)': this.getSDCardPercentage(device.sdCardInfo?.sd2),
            'Memória Interna Usado (MB)': this.getSDCardUsed(device.sdCardInfo?.memory),
            'Memória Interna Total (MB)': this.getSDCardTotal(device.sdCardInfo?.memory),
            'Memória Interna Percentual (%)': this.getSDCardPercentage(device.sdCardInfo?.memory),
            'Canal 1': this.getChannelStatus(device.systemInfo?.channels, 1),
            'Canal 2': this.getChannelStatus(device.systemInfo?.channels, 2),
            'Canal 3': this.getChannelStatus(device.systemInfo?.channels, 3),
            'Canal 4': this.getChannelStatus(device.systemInfo?.channels, 4),
            'Servidor': device.server || 'N/A',
            'Firmware Comparação': this.getFirmwareComparisonText(device.firmwareComparison),
            'Prioridade Atualização': this.getFirmwarePriority(device.firmwareComparison)
        }));

        const mainSheet = XLSX.utils.json_to_sheet(mainData);
        XLSX.utils.book_append_sheet(workbook, mainSheet, 'Equipamentos');

        // Aba com resumo/dashboard
        const dashboardData = this.createDashboardData(devices);
        const dashboardSheet = XLSX.utils.json_to_sheet(dashboardData);
        XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Resumo');

        // Aba com problemas identificados
        const issuesData = this.createIssuesData(devices);
        if (issuesData.length > 0) {
            const issuesSheet = XLSX.utils.json_to_sheet(issuesData);
            XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Problemas');
        }

        // Download do arquivo
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        showToast('Sucesso', `Arquivo ${filename}.xlsx baixado com sucesso!`, 'success');
    }

    // Exportar para JSON
    exportToJSON(devices, filename = 'equipamentos_allcom') {
        const jsonData = {
            metadata: {
                exported_at: new Date().toISOString(),
                exported_at_brasilia: new Date().toLocaleString('pt-BR'),
                total_devices: devices.length,
                online_devices: devices.filter(d => d.isOnline).length,
                offline_devices: devices.filter(d => !d.isOnline).length,
                export_version: '2.0',
                system: 'Allcom JC450 Status System'
            },
            summary: {
                total: devices.length,
                online: devices.filter(d => d.isOnline).length,
                offline: devices.filter(d => !d.isOnline).length,
                critical_battery: devices.filter(d => this.isCriticalBattery(d)).length,
                avg_offline_days: this.calculateAverageOfflineDays(devices),
                firmware_distribution: this.getFirmwareDistribution(devices)
            },
            devices: devices.map(device => ({
                imei: device.imei,
                status: {
                    is_online: device.isOnline,
                    offline_days: device.offlineDays || 0,
                    last_communication: device.lastTime,
                    last_communication_brasilia: device.lastTimeBrasilia
                },
                hardware: {
                    firmware_version: device.firmwareVersion || device.version,
                    voltage: this.extractVoltageNumber(device),
                    signal_quality: this.extractSignalNumber(device),
                    iccid: device.iccid,
                    server: device.server,
                    cpu_temperature: this.extractTemperatureNumber(device)
                },
                connectivity: {
                    network: this.extractNetwork(device),
                    gps_status: this.extractGPS(device),
                    acc_status: this.extractACC(device)
                },
                storage: {
                    sd1: this.getStorageObject(device.sdCardInfo?.sd1),
                    sd2: this.getStorageObject(device.sdCardInfo?.sd2),
                    internal_memory: this.getStorageObject(device.sdCardInfo?.memory)
                },
                channels: this.getChannelsObject(device.systemInfo?.channels),
                firmware_analysis: {
                    comparison: device.firmwareComparison,
                    comparison_text: this.getFirmwareComparisonText(device.firmwareComparison),
                    update_priority: this.getFirmwarePriority(device.firmwareComparison)
                },
                raw_data: {
                    log: device.log,
                    self_check_param: device.selfCheckParam,
                    original_response: device.originalResponse
                }
            }))
        };

        const jsonContent = JSON.stringify(jsonData, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
    }

    // === FUNÇÕES DE FORMATAÇÃO E EXTRAÇÃO ===
    
    // Limpar texto para CSV
    cleanText(text) {
        if (!text) return 'N/A';
        return String(text).replace(/[\r\n]/g, ' ').trim();
    }

    // Extrair voltagem
    extractVoltage(device) {
        const voltage = this.extractVoltageNumber(device);
        return voltage ? `${voltage}V` : 'N/A';
    }

    extractVoltageNumber(device) {
        return device.power || device.systemInfo?.power || null;
    }

    // Extrair sinal
    extractSignal(device) {
        const signal = this.extractSignalNumber(device);
        return signal !== null ? signal : 'N/A';
    }

    extractSignalNumber(device) {
        return device.csq !== undefined ? device.csq : null;
    }

    // Extrair rede
    extractNetwork(device) {
        return device.systemInfo?.network || 'N/A';
    }

    // Extrair GPS
    extractGPS(device) {
        return device.systemInfo?.gps || 'N/A';
    }

    // Extrair ACC
    extractACC(device) {
        return device.systemInfo?.acc || 'N/A';
    }

    // Extrair temperatura
    extractTemperature(device) {
        const temp = this.extractTemperatureNumber(device);
        return temp ? `${temp}°C` : 'N/A';
    }

    extractTemperatureNumber(device) {
        return device.systemInfo?.cpuTemp || null;
    }

    // Obter status do cartão SD
    getSDCardStatus(sdInfo) {
        if (!sdInfo) return 'N/A';
        return sdInfo.status || 'Desconhecido';
    }

    // Obter espaço usado do cartão SD
    getSDCardUsed(sdInfo) {
        if (!sdInfo || !sdInfo.used) return 0;
        return this.parseStorageValue(sdInfo.used);
    }

    // Obter espaço total do cartão SD
    getSDCardTotal(sdInfo) {
        if (!sdInfo || !sdInfo.total) return 0;
        return this.parseStorageValue(sdInfo.total);
    }

    // Obter percentual usado do cartão SD
    getSDCardPercentage(sdInfo) {
        if (!sdInfo || !sdInfo.used || !sdInfo.total) return 0;
        const used = this.parseStorageValue(sdInfo.used);
        const total = this.parseStorageValue(sdInfo.total);
        if (total === 0) return 0;
        return Math.round((used / total) * 100);
    }

    // Converter valores de armazenamento para MB
    parseStorageValue(value) {
        if (!value) return 0;
        
        const str = String(value).toLowerCase();
        const num = parseFloat(str);
        
        if (str.includes('gb')) {
            return Math.round(num * 1024);
        } else if (str.includes('mb')) {
            return Math.round(num);
        } else if (str.includes('kb')) {
            return Math.round(num / 1024);
        }
        
        // Assumir MB se não tiver unidade
        return Math.round(num);
    }

    // Obter status de canal específico
    getChannelStatus(channels, channelNumber) {
        if (!channels || !Array.isArray(channels)) return 'N/A';
        
        const channel = channels.find(ch => ch.channel === channelNumber || ch.channel === `CH${channelNumber}`);
        return channel ? channel.status : 'N/A';
    }

    // Obter objeto de armazenamento para JSON
    getStorageObject(sdInfo) {
        if (!sdInfo) return null;
        
        return {
            status: sdInfo.status,
            used_mb: this.getSDCardUsed(sdInfo),
            total_mb: this.getSDCardTotal(sdInfo),
            percentage_used: this.getSDCardPercentage(sdInfo),
            raw_used: sdInfo.used,
            raw_total: sdInfo.total
        };
    }

    // Obter objeto de canais para JSON
    getChannelsObject(channels) {
        if (!channels || !Array.isArray(channels)) return {};
        
        const channelsObj = {};
        channels.forEach(ch => {
            const key = `channel_${ch.channel}`.replace('CH', '');
            channelsObj[key] = ch.status;
        });
        
        return channelsObj;
    }

    // Obter texto de comparação de firmware
    getFirmwareComparisonText(comparison) {
        if (!comparison) return 'N/A';
        
        switch (comparison.status) {
            case 'updated': return 'Atualizado';
            case 'outdated': return 'Desatualizado';
            case 'unknown': return 'Desconhecido';
            default: return 'N/A';
        }
    }

    // Obter prioridade de firmware
    getFirmwarePriority(comparison) {
        if (!comparison) return 'N/A';
        
        switch (comparison.priority) {
            case 'high': return 'Alta';
            case 'medium': return 'Média';
            case 'low': return 'Baixa';
            default: return 'N/A';
        }
    }

    // Verificar se bateria está crítica
    isCriticalBattery(device) {
        const voltage = this.extractVoltageNumber(device);
        return voltage && voltage < 11.5;
    }

    // Calcular média de dias offline
    calculateAverageOfflineDays(devices) {
        const offlineDevices = devices.filter(d => !d.isOnline);
        if (offlineDevices.length === 0) return 0;
        
        const totalDays = offlineDevices.reduce((sum, d) => sum + (d.offlineDays || 0), 0);
        return Math.round(totalDays / offlineDevices.length * 10) / 10;
    }

    // Obter distribuição de firmware
    getFirmwareDistribution(devices) {
        const distribution = {};
        
        devices.forEach(device => {
            const firmware = device.firmwareVersion || device.version || 'Desconhecido';
            distribution[firmware] = (distribution[firmware] || 0) + 1;
        });
        
        return distribution;
    }

    // === FUNÇÕES DE DADOS PARA EXCEL ===
    
    // Criar dados do dashboard para Excel
    createDashboardData(devices) {
        const totalDevices = devices.length;
        const onlineDevices = devices.filter(d => d.isOnline).length;
        const offlineDevices = devices.filter(d => !d.isOnline).length;
        const criticalBatteryDevices = devices.filter(d => this.isCriticalBattery(d)).length;
        const avgOfflineDays = this.calculateAverageOfflineDays(devices);
        
        return [
            { 'Métrica': 'Total de Equipamentos', 'Valor': totalDevices },
            { 'Métrica': 'Equipamentos Online', 'Valor': onlineDevices },
            { 'Métrica': 'Equipamentos Offline', 'Valor': offlineDevices },
            { 'Métrica': 'Taxa Online (%)', 'Valor': totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0 },
            { 'Métrica': 'Bateria Crítica', 'Valor': criticalBatteryDevices },
            { 'Métrica': 'Média Dias Offline', 'Valor': avgOfflineDays },
            { 'Métrica': 'Data da Exportação', 'Valor': new Date().toLocaleString('pt-BR') }
        ];
    }

    // Criar dados de problemas para Excel
    createIssuesData(devices) {
        const issues = [];

        devices.forEach(device => {
            // Bateria crítica
            if (this.isCriticalBattery(device)) {
                issues.push({
                    'IMEI': device.imei,
                    'Problema': 'Bateria Crítica',
                    'Detalhes': `Voltagem: ${this.extractVoltage(device)}`,
                    'Severidade': 'Alta'
                });
            }

            // Offline por muito tempo
            if (!device.isOnline && device.offlineDays > 7) {
                issues.push({
                    'IMEI': device.imei,
                    'Problema': 'Offline por Muito Tempo',
                    'Detalhes': `${device.offlineDays} dias offline`,
                    'Severidade': device.offlineDays > 30 ? 'Crítica' : 'Média'
                });
            }

            // Problemas de armazenamento
            if (this.hasStorageIssues(device)) {
                issues.push({
                    'IMEI': device.imei,
                    'Problema': 'Armazenamento Quase Cheio',
                    'Detalhes': this.getStorageDetails(device.sdCardInfo),
                    'Severidade': 'Média'
                });
            }

            // Firmware desatualizado
            if (device.firmwareComparison && device.firmwareComparison.status === 'outdated') {
                issues.push({
                    'IMEI': device.imei,
                    'Problema': 'Firmware Desatualizado',
                    'Detalhes': `Atual: ${device.firmwareVersion || 'N/A'}`,
                    'Severidade': device.firmwareComparison.priority === 'high' ? 'Alta' : 'Média'
                });
            }
        });

        return issues;
    }

    // Verificar se há problemas de armazenamento
    hasStorageIssues(device) {
        const checkStorage = (storage) => {
            if (!storage) return false;
            const percentage = this.getSDCardPercentage(storage);
            return percentage > 85; // Mais de 85% usado
        };

        return checkStorage(device.sdCardInfo?.sd1) || 
               checkStorage(device.sdCardInfo?.sd2) || 
               checkStorage(device.sdCardInfo?.memory);
    }

    // === FUNÇÕES AUXILIARES PARA COMPATIBILIDADE ===

    // Formatar informações do cartão SD (compatibilidade)
    formatSDCard(sdInfo) {
        if (!sdInfo) return 'N/A';
        const used = this.getSDCardUsed(sdInfo);
        const total = this.getSDCardTotal(sdInfo);
        return `${used}MB / ${total}MB`;
    }

    // Formatar status dos canais (compatibilidade)
    formatChannels(channels) {
        if (!channels || channels.length === 0) return 'N/A';
        return channels.map(ch => `${ch.channel}: ${ch.status}`).join(', ');
    }

    // Obter detalhes de armazenamento para problemas
    getStorageDetails(sdCardInfo) {
        const details = [];
        if (sdCardInfo?.sd1) {
            const percentage = this.getSDCardPercentage(sdCardInfo.sd1);
            details.push(`SD1: ${percentage}% usado`);
        }
        if (sdCardInfo?.sd2) {
            const percentage = this.getSDCardPercentage(sdCardInfo.sd2);
            details.push(`SD2: ${percentage}% usado`);
        }
        if (sdCardInfo?.memory) {
            const percentage = this.getSDCardPercentage(sdCardInfo.memory);
            details.push(`Memória: ${percentage}% usado`);
        }
        return details.join(', ') || 'N/A';
    }

    // Download de arquivo
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        showToast('Sucesso', `Arquivo ${filename} baixado com sucesso!`, 'success');
    }

    // Criar botões de exportação
    createExportButtons() {
        const exportHTML = `
            <div class="export-section">
                <h3><i class="fas fa-download"></i> Exportar Dados</h3>
                <div class="export-buttons">
                    <button class="btn btn-export" onclick="exportManager.exportToCSV(filteredResults)">
                        <i class="fas fa-file-csv"></i> CSV
                    </button>
                    <button class="btn btn-export" onclick="exportManager.exportToExcel(filteredResults)">
                        <i class="fas fa-file-excel"></i> Excel
                    </button>
                    <button class="btn btn-export" onclick="exportManager.exportToJSON(filteredResults)">
                        <i class="fas fa-file-code"></i> JSON
                    </button>
                </div>
            </div>
        `;

        // Adicionar após a seção de resultados
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection && !document.querySelector('.export-section')) {
            resultsSection.insertAdjacentHTML('beforeend', exportHTML);
        }
    }
}

// Instância global
const exportManager = new ExportManager();

// Export for use in main app
if (typeof window !== 'undefined') {
    window.ExportManager = ExportManager;
}
