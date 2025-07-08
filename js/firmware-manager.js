// Firmware Manager - Sistema de gerenciamento e comparação de firmware
class FirmwareManager {
    constructor() {
        this.predefinedFirmwares = [
            'C450Pro_2.0.16_20250526',
            'C450Pro_2.0.13_20250410', 
            'C450Pro_2.0.08_20241028'
        ];
        this.customFirmwares = this.loadCustomFirmwares();
        this.currentReference = this.loadReferenceFirmware();
        
        console.log('✅ Firmware Manager initialized');
    }

    // Parse firmware version string
    parseFirmwareVersion(firmware) {
        if (!firmware || typeof firmware !== 'string') {
            return null;
        }

        // Pattern: C450[Pp]ro_V?[Major].[Minor].[Patch]_[YYYYMMDD or YYMMDD] (V is optional)
        const pattern = /C450[Pp]ro_V?(\d+)\.(\d+)\.(\d+)_(\d{6,8})/;
        const match = firmware.match(pattern);
        
        if (!match) {
            return null;
        }

        const [, major, minor, patch, date] = match;
        
        // Convert date to actual date
        let year, month, day;
        if (date.length === 8) {
            // YYYYMMDD format
            year = parseInt(date.substring(0, 4));
            month = parseInt(date.substring(4, 6)) - 1; // JS months are 0-based
            day = parseInt(date.substring(6, 8));
        } else {
            // YYMMDD format
            year = 2000 + parseInt(date.substring(0, 2));
            month = parseInt(date.substring(2, 4)) - 1; // JS months are 0-based
            day = parseInt(date.substring(4, 6));
        }
        
        return {
            original: firmware,
            major: parseInt(major),
            minor: parseInt(minor), 
            patch: parseInt(patch),
            date: new Date(year, month, day),
            dateString: date,
            isValid: true
        };
    }

    // Compare two firmware versions
    compareFirmware(current, reference) {
        const currentParsed = this.parseFirmwareVersion(current);
        const referenceParsed = this.parseFirmwareVersion(reference);
        
        if (!currentParsed || !referenceParsed) {
            return {
                status: 'unknown',
                message: 'Versão de firmware inválida',
                comparison: null,
                priority: 'unknown'
            };
        }

        // Compare version numbers (major.minor.patch)
        if (currentParsed.major !== referenceParsed.major) {
            const isNewer = currentParsed.major > referenceParsed.major;
            return {
                status: isNewer ? 'newer' : 'outdated',
                message: isNewer ? 'Versão major mais recente' : 'Versão major desatualizada',
                comparison: {
                    current: currentParsed,
                    reference: referenceParsed,
                    versionDiff: currentParsed.major - referenceParsed.major
                },
                priority: isNewer ? 'low' : 'high'
            };
        }

        if (currentParsed.minor !== referenceParsed.minor) {
            const isNewer = currentParsed.minor > referenceParsed.minor;
            return {
                status: isNewer ? 'newer' : 'outdated',
                message: isNewer ? 'Versão minor mais recente' : 'Versão minor desatualizada',
                comparison: {
                    current: currentParsed,
                    reference: referenceParsed,
                    versionDiff: currentParsed.minor - referenceParsed.minor
                },
                priority: isNewer ? 'low' : 'medium'
            };
        }

        if (currentParsed.patch !== referenceParsed.patch) {
            const isNewer = currentParsed.patch > referenceParsed.patch;
            return {
                status: isNewer ? 'newer' : 'outdated',
                message: isNewer ? 'Versão patch mais recente' : 'Versão patch desatualizada',
                comparison: {
                    current: currentParsed,
                    reference: referenceParsed,
                    versionDiff: currentParsed.patch - referenceParsed.patch
                },
                priority: isNewer ? 'low' : 'low'
            };
        }

        // Compare dates if versions are equal
        const dateDiff = currentParsed.date.getTime() - referenceParsed.date.getTime();
        
        if (dateDiff === 0) {
            return {
                status: 'updated',
                message: 'Firmware atualizado',
                comparison: {
                    current: currentParsed,
                    reference: referenceParsed,
                    versionDiff: 0
                },
                priority: 'low'
            };
        }

        const isNewer = dateDiff > 0;
        return {
            status: isNewer ? 'newer' : 'outdated',
            message: isNewer ? 'Build mais recente' : 'Build desatualizado',
            comparison: {
                current: currentParsed,
                reference: referenceParsed,
                dateDiff: Math.abs(dateDiff / (1000 * 60 * 60 * 24)) // days
            },
            priority: isNewer ? 'low' : 'low'
        };
    }

    // Get all available firmwares
    getAllFirmwares() {
        return [...this.predefinedFirmwares, ...this.customFirmwares].sort((a, b) => {
            const aParsed = this.parseFirmwareVersion(a);
            const bParsed = this.parseFirmwareVersion(b);
            
            if (!aParsed || !bParsed) return 0;
            
            // Sort by version descending (newest first)
            if (aParsed.major !== bParsed.major) return bParsed.major - aParsed.major;
            if (aParsed.minor !== bParsed.minor) return bParsed.minor - aParsed.minor;
            if (aParsed.patch !== bParsed.patch) return bParsed.patch - aParsed.patch;
            return bParsed.date.getTime() - aParsed.date.getTime();
        });
    }

    // Add custom firmware
    addCustomFirmware(firmware) {
        const parsed = this.parseFirmwareVersion(firmware);
        
        if (!parsed) {
            throw new Error('Formato de firmware inválido. Use: C450pro_[Major].[Minor].[Patch]_[YYMMDD]');
        }

        // Check if already exists
        const allFirmwares = [...this.predefinedFirmwares, ...this.customFirmwares];
        if (allFirmwares.includes(firmware)) {
            throw new Error('Este firmware já existe na lista');
        }

        this.customFirmwares.push(firmware);
        this.saveCustomFirmwares();
        
        console.log('✅ Firmware customizado adicionado:', firmware);
        return parsed;
    }

    // Remove custom firmware
    removeCustomFirmware(firmware) {
        const index = this.customFirmwares.indexOf(firmware);
        if (index > -1) {
            this.customFirmwares.splice(index, 1);
            this.saveCustomFirmwares();
            console.log('🗑️ Firmware customizado removido:', firmware);
        }
    }

    // Set reference firmware
    setReferenceFirmware(firmware) {
        const parsed = this.parseFirmwareVersion(firmware);
        if (!parsed) {
            throw new Error('Firmware de referência inválido');
        }

        this.currentReference = firmware;
        this.saveReferenceFirmware();
        
        console.log('📌 Firmware de referência definido:', firmware);
        return parsed;
    }

    // Get current reference firmware
    getReferenceFirmware() {
        return this.currentReference;
    }

    // Analyze device firmware list
    analyzeFirmwareDistribution(deviceResults) {
        if (!this.currentReference) {
            return {
                error: 'Nenhum firmware de referência definido',
                total: deviceResults.length,
                analysis: null
            };
        }

        const analysis = {
            total: deviceResults.length,
            updated: 0,
            outdated: 0,
            unknown: 0,
            newer: 0,
            reference: this.currentReference,
            distribution: {},
            updateRequired: [],
            priorities: { high: 0, medium: 0, low: 0 }
        };

        deviceResults.forEach(device => {
            const firmware = device.version || device.firmware;
            const comparison = this.compareFirmware(firmware, this.currentReference);
            
            // Count status
            if (comparison.status === 'updated') analysis.updated++;
            else if (comparison.status === 'outdated') analysis.outdated++;
            else if (comparison.status === 'newer') analysis.newer++;
            else analysis.unknown++;

            // Count priorities
            if (comparison.priority && analysis.priorities[comparison.priority] !== undefined) {
                analysis.priorities[comparison.priority]++;
            }

            // Distribution by firmware version
            const firmwareKey = firmware || 'Desconhecido';
            analysis.distribution[firmwareKey] = (analysis.distribution[firmwareKey] || 0) + 1;

            // Add to update required list if outdated
            if (comparison.status === 'outdated') {
                analysis.updateRequired.push({
                    imei: device.imei,
                    currentFirmware: firmware,
                    comparison: comparison,
                    priority: comparison.priority
                });
            }
        });

        return analysis;
    }

    // Generate firmware update report
    generateUpdateReport(deviceResults) {
        const analysis = this.analyzeFirmwareDistribution(deviceResults);
        
        if (analysis.error) {
            return `❌ ${analysis.error}`;
        }

        const updatePercentage = ((analysis.outdated / analysis.total) * 100).toFixed(1);
        const upToDatePercentage = ((analysis.updated / analysis.total) * 100).toFixed(1);

        let report = `📊 Relatório de Firmware (${analysis.total} equipamentos)\n\n`;
        report += `🎯 Firmware de Referência: ${analysis.reference}\n\n`;
        report += `✅ Atualizados: ${analysis.updated} (${upToDatePercentage}%)\n`;
        report += `🔄 Precisam Atualizar: ${analysis.outdated} (${updatePercentage}%)\n`;
        report += `🆕 Mais Recentes: ${analysis.newer}\n`;
        report += `❓ Desconhecidos: ${analysis.unknown}\n\n`;

        if (analysis.priorities.high > 0) {
            report += `🚨 Prioridade Alta: ${analysis.priorities.high} equipamentos\n`;
        }
        if (analysis.priorities.medium > 0) {
            report += `⚠️ Prioridade Média: ${analysis.priorities.medium} equipamentos\n`;
        }

        return report;
    }

    // Save/Load functions
    saveCustomFirmwares() {
        localStorage.setItem('allcom_custom_firmwares', JSON.stringify(this.customFirmwares));
    }

    loadCustomFirmwares() {
        try {
            const saved = localStorage.getItem('allcom_custom_firmwares');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erro ao carregar firmwares customizados:', error);
            return [];
        }
    }

    saveReferenceFirmware() {
        localStorage.setItem('allcom_reference_firmware', this.currentReference);
    }

    loadReferenceFirmware() {
        return localStorage.getItem('allcom_reference_firmware') || '';
    }

    // Clear all data
    clearAllData() {
        this.customFirmwares = [];
        this.currentReference = '';
        localStorage.removeItem('allcom_custom_firmwares');
        localStorage.removeItem('allcom_reference_firmware');
        console.log('🧹 Dados de firmware limpos');
    }

    // Validate firmware format
    isValidFirmwareFormat(firmware) {
        return this.parseFirmwareVersion(firmware) !== null;
    }

    // Get firmware suggestions based on pattern
    getFirmwareSuggestions(partial) {
        const allFirmwares = this.getAllFirmwares();
        return allFirmwares.filter(fw => 
            fw.toLowerCase().includes(partial.toLowerCase())
        ).slice(0, 5);
    }
}

// Export for use in main app
if (typeof window !== 'undefined') {
    window.FirmwareManager = FirmwareManager;
}
