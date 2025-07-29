// Dashboard Manager - Métricas e Visualizações
class DashboardManager {
    constructor() {
        this.metrics = {
            total: 0,
            online: 0,
            offline: 0,
            firmwareVersions: {},
            lastUpdate: null
        };
        this.firmwareDevices = {};
    }

    // Calcular métricas dos dispositivos
    calculateMetrics(devices) {
        this.metrics = {
            total: devices.length,
            online: devices.filter(d => d.isOnline).length,
            offline: devices.filter(d => !d.isOnline).length,
            firmwareVersions: this.groupByFirmware(devices),
            lastUpdate: new Date().toLocaleString('pt-BR'),
            avgOfflineDays: this.calculateAvgOfflineDays(devices),
            storageIssues: devices.filter(d => this.hasStorageIssues(d)).length
        };

        this.updateDashboard();
        return this.metrics;
    }

    // Verificar problemas de armazenamento
    hasStorageIssues(device) {
        if (!device.sdCardInfo) return false;
        
        // Verificar se algum SD está com mais de 90% de uso
        const checkUsage = (sd) => {
            if (!sd) return false;
            const used = parseFloat(sd.used);
            const total = parseFloat(sd.total);
            return (used / total) > 0.9;
        };

        return checkUsage(device.sdCardInfo.sd1) || 
               checkUsage(device.sdCardInfo.sd2) ||
               checkUsage(device.sdCardInfo.memory);
    }

    // Agrupar por versão de firmware
    groupByFirmware(devices) {
        const versions = {};
        const versionDevices = {};
        
        devices.forEach(device => {
            const version = device.firmwareVersion || 'Desconhecida';
            versions[version] = (versions[version] || 0) + 1;
            
            if (!versionDevices[version]) {
                versionDevices[version] = [];
            }
            versionDevices[version].push(device);
        });
        
        // Armazenar dados detalhados para uso posterior
        this.firmwareDevices = versionDevices;
        
        // Debug: verificar se os dados foram armazenados corretamente
        console.log('📊 Firmware devices armazenados:', Object.keys(this.firmwareDevices));
        
        return versions;
    }

    // Calcular média de dias offline
    calculateAvgOfflineDays(devices) {
        const offlineDevices = devices.filter(d => !d.isOnline && typeof d.offlineDays === 'number');
        if (offlineDevices.length === 0) return 0;
        
        const totalDays = offlineDevices.reduce((sum, d) => sum + d.offlineDays, 0);
        return Math.round(totalDays / offlineDevices.length);
    }

    // Atualizar dashboard na interface
    updateDashboard() {
        this.createDashboardHTML();
        this.updateMetricsCards();
        this.createCharts();
    }

    // Criar HTML do dashboard
    createDashboardHTML() {
        const dashboardHTML = `
            <div class="dashboard-section" id="dashboardSection">
                <div class="dashboard-header">
                    <h2><i class="fas fa-tachometer-alt"></i> Dashboard - Allcom JC450</h2>
                    <div class="last-update">Última atualização: <span id="lastUpdate">${this.metrics.lastUpdate}</span></div>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-card total">
                        <div class="metric-icon"><i class="fas fa-mobile-alt"></i></div>
                        <div class="metric-content">
                            <div class="metric-value" id="totalDevices">${this.metrics.total}</div>
                            <div class="metric-label">Total de Equipamentos</div>
                        </div>
                    </div>
                    
                    <div class="metric-card online">
                        <div class="metric-icon"><i class="fas fa-wifi"></i></div>
                        <div class="metric-content">
                            <div class="metric-value" id="onlineDevices">${this.metrics.online}</div>
                            <div class="metric-label">Online</div>
                            <div class="metric-percentage">${this.getPercentage(this.metrics.online, this.metrics.total)}%</div>
                        </div>
                    </div>
                    
                    <div class="metric-card offline">
                        <div class="metric-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="metric-content">
                            <div class="metric-value" id="offlineDevices">${this.metrics.offline}</div>
                            <div class="metric-label">Offline</div>
                            <div class="metric-percentage">${this.getPercentage(this.metrics.offline, this.metrics.total)}%</div>
                        </div>
                    </div>
                    
                    <div class="metric-card info">
                        <div class="metric-icon"><i class="fas fa-clock"></i></div>
                        <div class="metric-content">
                            <div class="metric-value" id="avgOfflineDays">${this.metrics.avgOfflineDays}</div>
                            <div class="metric-label">Média Dias Offline</div>
                        </div>
                    </div>
                    
                    <div class="metric-card storage">
                        <div class="metric-icon"><i class="fas fa-hdd"></i></div>
                        <div class="metric-content">
                            <div class="metric-value" id="storageIssues">${this.metrics.storageIssues}</div>
                            <div class="metric-label">Problemas Armazenamento</div>
                            <div class="metric-note">> 90% uso</div>
                        </div>
                    </div>
                </div>
                
                <div class="charts-grid">
                    <div class="chart-container">
                        <h3>Distribuição de Status</h3>
                        <div class="chart-placeholder" id="statusChart">
                            <canvas id="statusPieChart" width="300" height="200"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Versões de Firmware</h3>
                        <div class="firmware-list" id="firmwareList"></div>
                    </div>
                </div>
            </div>
        `;

        // Verificar se dashboard já existe
        let dashboardSection = document.getElementById('dashboardSection');
        if (!dashboardSection) {
            // Inserir dashboard antes da seção de entrada
            const inputSection = document.querySelector('.input-section');
            inputSection.insertAdjacentHTML('beforebegin', dashboardHTML);
        } else {
            dashboardSection.outerHTML = dashboardHTML;
        }
    }

    // Atualizar cards de métricas
    updateMetricsCards() {
        const updates = {
            'totalDevices': this.metrics.total,
            'onlineDevices': this.metrics.online,
            'offlineDevices': this.metrics.offline,
            'avgOfflineDays': this.metrics.avgOfflineDays,
            'storageIssues': this.metrics.storageIssues,
            'lastUpdate': this.metrics.lastUpdate
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Atualizar percentuais
        const onlinePercentage = document.querySelector('#onlineDevices').parentElement.querySelector('.metric-percentage');
        const offlinePercentage = document.querySelector('#offlineDevices').parentElement.querySelector('.metric-percentage');
        
        if (onlinePercentage) onlinePercentage.textContent = `${this.getPercentage(this.metrics.online, this.metrics.total)}%`;
        if (offlinePercentage) offlinePercentage.textContent = `${this.getPercentage(this.metrics.offline, this.metrics.total)}%`;
    }

    // Criar gráficos
    createCharts() {
        this.createStatusPieChart();
        this.createFirmwareList();
    }

    // Gráfico de pizza para status
    createStatusPieChart() {
        const canvas = document.getElementById('statusPieChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 70;

        // Limpar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dados do gráfico
        const total = this.metrics.total;
        if (total === 0) return;

        const onlineAngle = (this.metrics.online / total) * 2 * Math.PI;
        const offlineAngle = (this.metrics.offline / total) * 2 * Math.PI;

        // Desenhar setor online
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, 0, onlineAngle);
        ctx.closePath();
        ctx.fillStyle = '#16a085';
        ctx.fill();

        // Desenhar setor offline
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, onlineAngle, onlineAngle + offlineAngle);
        ctx.closePath();
        ctx.fillStyle = '#e74c3c';
        ctx.fill();

        // Adicionar texto central
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(total, centerX, centerY + 5);
        ctx.font = '12px Inter';
        ctx.fillText('Total', centerX, centerY + 20);
    }

    // Lista de versões de firmware
    createFirmwareList() {
        const container = document.getElementById('firmwareList');
        if (!container) return;

        const firmwareHTML = Object.entries(this.metrics.firmwareVersions)
            .sort(([,a], [,b]) => b - a)
            .map(([version, count]) => `
                <div class="firmware-item clickable" data-firmware-version="${version}">
                    <div class="firmware-version">${version}</div>
                    <div class="firmware-count">${count} equipamentos</div>
                    <div class="firmware-bar">
                        <div class="firmware-fill" style="width: ${this.getPercentage(count, this.metrics.total)}%"></div>
                    </div>
                    <div class="firmware-click-hint">
                        <i class="fas fa-mouse-pointer"></i> Clique para ver IMEIs
                    </div>
                </div>
            `).join('');

        container.innerHTML = firmwareHTML;
        
        // Adicionar event listeners para cada item
        container.querySelectorAll('.firmware-item.clickable').forEach(item => {
            item.addEventListener('click', () => {
                const version = item.getAttribute('data-firmware-version');
                this.showFirmwareDetails(version);
            });
        });
    }

    // Calcular percentual
    getPercentage(value, total) {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    }

    // Mostrar/ocultar dashboard
    toggleDashboard() {
        const dashboard = document.getElementById('dashboardSection');
        if (dashboard) {
            dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Gerar métricas de firmware com comparação
    generateFirmwareMetrics(devices, firmwareManager = null) {
        if (!firmwareManager || !firmwareManager.getReferenceFirmware()) {
            // Fallback para funcionalidade básica de firmware
            return this.generateBasicFirmwareChart(devices);
        }

        const analysis = firmwareManager.analyzeFirmwareDistribution(devices);
        
        let html = '<div class="firmware-analysis-dashboard">';
        
        // Summary cards
        html += '<div class="firmware-summary-cards">';
        html += `
            <div class="firmware-summary-card updated">
                <div class="firmware-summary-number">${analysis.updated}</div>
                <div class="firmware-summary-label">Atualizados</div>
                <div class="firmware-summary-percentage">${((analysis.updated / analysis.total) * 100).toFixed(1)}%</div>
            </div>
            <div class="firmware-summary-card outdated">
                <div class="firmware-summary-number">${analysis.outdated}</div>
                <div class="firmware-summary-label">Desatualizados</div>
                <div class="firmware-summary-percentage">${((analysis.outdated / analysis.total) * 100).toFixed(1)}%</div>
            </div>
            <div class="firmware-summary-card newer">
                <div class="firmware-summary-number">${analysis.newer}</div>
                <div class="firmware-summary-label">Mais Recentes</div>
                <div class="firmware-summary-percentage">${((analysis.newer / analysis.total) * 100).toFixed(1)}%</div>
            </div>
            <div class="firmware-summary-card unknown">
                <div class="firmware-summary-number">${analysis.unknown}</div>
                <div class="firmware-summary-label">Desconhecidos</div>
                <div class="firmware-summary-percentage">${((analysis.unknown / analysis.total) * 100).toFixed(1)}%</div>
            </div>
        `;
        html += '</div>';

        // Reference firmware info
        html += `
            <div class="firmware-reference-info">
                <p><strong>Firmware de Referência:</strong> <code>${analysis.reference}</code></p>
            </div>
        `;

        // Priority breakdown
        if (analysis.priorities.high > 0 || analysis.priorities.medium > 0) {
            html += '<div class="firmware-priority-breakdown">';
            html += '<h4>Prioridades de Atualização:</h4>';
            html += '<div class="priority-items">';
            
            if (analysis.priorities.high > 0) {
                html += `<span class="priority-item high">🚨 ${analysis.priorities.high} Críticos</span>`;
            }
            if (analysis.priorities.medium > 0) {
                html += `<span class="priority-item medium">⚠️ ${analysis.priorities.medium} Importantes</span>`;
            }
            
            html += '</div></div>';
        }

        // Update required list (top 10)
        if (analysis.updateRequired.length > 0) {
            html += '<div class="update-required-section">';
            html += '<h4>Equipamentos Precisando de Atualização:</h4>';
            html += '<div class="update-required-list">';
            
            analysis.updateRequired.slice(0, 10).forEach(item => {
                html += `
                    <div class="update-required-item">
                        <div>
                            <div class="update-required-imei">${item.imei}</div>
                            <div class="update-required-firmware">${item.currentFirmware}</div>
                        </div>
                        <span class="update-priority ${item.priority}">
                            ${item.priority === 'high' ? '🚨' : item.priority === 'medium' ? '⚠️' : '📋'}
                        </span>
                    </div>
                `;
            });
            
            if (analysis.updateRequired.length > 10) {
                html += `<div class="update-required-more">... e mais ${analysis.updateRequired.length - 10} equipamentos</div>`;
            }
            
            html += '</div></div>';
        }

        html += '</div>';
        return html;
    }

    // Gerar gráfico básico de firmware (fallback)
    generateBasicFirmwareChart(devices) {
        const firmwareVersions = this.groupByFirmware(devices);
        
        let html = '<div class="firmware-basic-chart">';
        html += '<h3>Distribuição de Firmware</h3>';
        html += '<div class="firmware-list">';
        
        Object.entries(firmwareVersions)
            .sort(([,a], [,b]) => b - a)
            .forEach(([version, count]) => {
                const percentage = this.getPercentage(count, devices.length);
                html += `
                    <div class="firmware-item clickable" data-firmware-version="${version}">
                        <div class="firmware-version">${version}</div>
                        <div class="firmware-count">${count} equipamentos (${percentage}%)</div>
                        <div class="firmware-bar">
                            <div class="firmware-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="firmware-click-hint">
                            <i class="fas fa-mouse-pointer"></i> Clique para ver IMEIs
                        </div>
                    </div>
                `;
            });
        
        html += '</div>';
        html += '</div>';
        
        return html;
    }

    // Integrar análise de firmware no dashboard principal
    generateGeneralMetricsWithFirmware(devices, firmwareManager = null) {
        this.calculateMetrics(devices);
        
        let html = '<div class="metrics-grid">';
        
        // Métricas básicas
        html += `
            <div class="metric-card">
                <div class="metric-icon"><i class="fas fa-mobile-alt"></i></div>
                <div class="metric-content">
                    <div class="metric-number">${this.metrics.total}</div>
                    <div class="metric-label">Total de Equipamentos</div>
                </div>
            </div>
            
            <div class="metric-card online">
                <div class="metric-icon"><i class="fas fa-wifi"></i></div>
                <div class="metric-content">
                    <div class="metric-number">${this.metrics.online}</div>
                    <div class="metric-label">Online (${((this.metrics.online / this.metrics.total) * 100).toFixed(1)}%)</div>
                </div>
            </div>
            
            <div class="metric-card offline">
                <div class="metric-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="metric-content">
                    <div class="metric-number">${this.metrics.offline}</div>
                    <div class="metric-label">Offline (${((this.metrics.offline / this.metrics.total) * 100).toFixed(1)}%)</div>
                </div>
            </div>
        `;

        // Métricas de firmware se manager disponível
        if (firmwareManager && firmwareManager.getReferenceFirmware()) {
            const analysis = firmwareManager.analyzeFirmwareDistribution(devices);
            
            html += `
                <div class="metric-card firmware-outdated">
                    <div class="metric-icon"><i class="fas fa-download"></i></div>
                    <div class="metric-content">
                        <div class="metric-number">${analysis.outdated}</div>
                        <div class="metric-label">Precisam Atualizar (${((analysis.outdated / this.metrics.total) * 100).toFixed(1)}%)</div>
                    </div>
                </div>
                
                <div class="metric-card firmware-updated">
                    <div class="metric-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="metric-content">
                        <div class="metric-number">${analysis.updated}</div>
                        <div class="metric-label">Firmware Atualizado (${((analysis.updated / this.metrics.total) * 100).toFixed(1)}%)</div>
                    </div>
                </div>
                
                <div class="metric-card firmware-priority">
                    <div class="metric-icon"><i class="fas fa-flag"></i></div>
                    <div class="metric-content">
                        <div class="metric-number">${analysis.priorities.high}</div>
                        <div class="metric-label">Atualizações Críticas</div>
                    </div>
                </div>
            `;
        }

        // Outras métricas
        html += `
            <div class="metric-card storage">
                <div class="metric-icon"><i class="fas fa-hdd"></i></div>
                <div class="metric-content">
                    <div class="metric-number">${this.metrics.storageIssues}</div>
                    <div class="metric-label">Problemas de Armazenamento</div>
                </div>
            </div>
        `;

        html += '</div>';
        html += `<div class="dashboard-last-update">Última atualização: ${this.metrics.lastUpdate}</div>`;
        
        return html;
    }

    // Mostrar detalhes dos equipamentos de uma versão específica de firmware
    showFirmwareDetails(firmwareVersion) {
        // Verificar se firmwareDevices existe e tem dados
        if (!this.firmwareDevices || !this.firmwareDevices[firmwareVersion]) {
            showToast('Nenhum equipamento encontrado para esta versão', 'error');
            console.error('firmwareDevices não inicializado ou versão não encontrada:', firmwareVersion);
            return;
        }

        const devices = this.firmwareDevices[firmwareVersion];
        if (!devices || devices.length === 0) {
            showToast('Nenhum equipamento encontrado para esta versão', 'error');
            return;
        }

        // Criar conteúdo do modal
        const modalContent = `
            <div class="firmware-modal">
                <div class="firmware-modal-header">
                    <h3>Equipamentos com Firmware: ${firmwareVersion}</h3>
                    <span class="firmware-count-badge">${devices.length} equipamentos</span>
                </div>
                
                <div class="firmware-devices-grid">
                    ${devices.map(device => `
                        <div class="firmware-device-card ${device.isOnline ? 'online' : 'offline'}" 
                             onclick="showDeviceDetails('${device.imei}')">
                            <div class="device-imei">
                                <strong>${device.imei}</strong>
                                <span class="device-status ${device.isOnline ? 'online' : 'offline'}">
                                    <i class="fas fa-circle"></i>
                                    ${device.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <div class="device-info">
                                <div class="device-last-seen">
                                    <i class="fas fa-clock"></i>
                                    ${device.lastTimeBrasilia || 'N/A'}
                                </div>
                                ${!device.isOnline ? `
                                    <div class="device-offline-days">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        ${device.offlineDays || 0} dias offline
                                    </div>
                                ` : ''}
                            </div>
                            <div class="device-actions">
                                <i class="fas fa-info-circle"></i>
                                Clique para mais detalhes
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="firmware-modal-footer">
                    <button class="btn btn-export" onclick="dashboardManager.exportFirmwareDevices('${firmwareVersion}')">
                        <i class="fas fa-download"></i> Exportar Lista
                    </button>
                    <button class="btn btn-secondary" onclick="closeFirmwareModal()">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
            </div>
        `;

        // Criar e mostrar modal
        this.createFirmwareModal(modalContent);
    }

    // Criar modal para firmware
    createFirmwareModal(content) {
        // Remover modal existente se houver
        const existingModal = document.getElementById('firmwareModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Criar novo modal
        const modal = document.createElement('div');
        modal.id = 'firmwareModal';
        modal.className = 'firmware-modal-overlay';
        modal.innerHTML = `
            <div class="firmware-modal-content">
                ${content}
            </div>
        `;

        document.body.appendChild(modal);
        
        // Mostrar modal com animação
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Fechar modal ao clicar no overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFirmwareModal();
            }
        });
    }

    // Fechar modal de firmware
    closeFirmwareModal() {
        const modal = document.getElementById('firmwareModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Exportar lista de dispositivos de uma versão específica
    exportFirmwareDevices(firmwareVersion) {
        const devices = this.firmwareDevices[firmwareVersion];
        if (!devices || devices.length === 0) {
            showToast('Nenhum equipamento para exportar', 'error');
            return;
        }

        // Usar o ExportManager se disponível
        if (typeof exportManager !== 'undefined') {
            const filename = `firmware_${firmwareVersion.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;
            exportManager.exportToCSV(devices, filename);
            showToast(`Lista exportada: ${filename}.csv`, 'success');
        } else {
            // Fallback simples
            const csvContent = devices.map(d => `${d.imei},${d.isOnline ? 'Online' : 'Offline'},${d.firmwareVersion},${d.lastTimeBrasilia}`).join('\n');
            const blob = new Blob([`IMEI,Status,Firmware,Última Comunicação\n${csvContent}`], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `firmware_${firmwareVersion}_devices.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Lista exportada com sucesso', 'success');
        }
    }
}

// Instância global
const dashboardManager = new DashboardManager();

// Export for use in main app
if (typeof window !== 'undefined') {
    window.DashboardManager = DashboardManager;
}
