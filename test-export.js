// Teste do Sistema de Exportação
console.log('🧪 Testando Sistema de Exportação...');

// Dados de exemplo para teste
const testDevices = [
    {
        imei: '861123456789012',
        isOnline: true,
        firmwareVersion: 'C450Pro_2.0.16_20250526',
        lastTimeBrasilia: '2025-07-07 14:30:00',
        offlineDays: 0,
        power: 12.5,
        csq: 15,
        iccid: '89550000000000000001',
        server: 'srv1.allcom.com.br',
        systemInfo: {
            network: '4G',
            gps: 'Ativo',
            acc: 'ON',
            cpuTemp: 45,
            channels: [
                { channel: 1, status: 'Ativo' },
                { channel: 2, status: 'Inativo' },
                { channel: 3, status: 'Ativo' },
                { channel: 4, status: 'Erro' }
            ]
        },
        sdCardInfo: {
            sd1: { status: 'OK', used: '1500MB', total: '8000MB' },
            sd2: { status: 'OK', used: '3200MB', total: '16000MB' },
            memory: { status: 'OK', used: '256MB', total: '512MB' }
        },
        firmwareComparison: {
            status: 'updated',
            priority: 'low'
        }
    },
    {
        imei: '861123456789013',
        isOnline: false,
        firmwareVersion: 'C450Pro_2.0.08_20241028',
        lastTimeBrasilia: '2025-06-15 08:45:00',
        offlineDays: 22,
        power: 10.8,
        csq: 8,
        iccid: '89550000000000000002',
        server: 'srv2.allcom.com.br',
        systemInfo: {
            network: '3G',
            gps: 'Inativo',
            acc: 'OFF',
            cpuTemp: 52,
            channels: [
                { channel: 1, status: 'Erro' },
                { channel: 2, status: 'Inativo' },
                { channel: 3, status: 'Inativo' },
                { channel: 4, status: 'Inativo' }
            ]
        },
        sdCardInfo: {
            sd1: { status: 'Erro', used: '7800MB', total: '8000MB' },
            sd2: null,
            memory: { status: 'OK', used: '450MB', total: '512MB' }
        },
        firmwareComparison: {
            status: 'outdated',
            priority: 'high'
        }
    }
];

// Função para testar exportação CSV
function testCSVExport() {
    console.log('\n📊 Testando exportação CSV...');
    
    try {
        const exportManager = new ExportManager();
        
        // Testar funções de extração
        console.log('✅ Teste de extração de voltagem:', exportManager.extractVoltage(testDevices[0]));
        console.log('✅ Teste de extração de sinal:', exportManager.extractSignal(testDevices[0]));
        console.log('✅ Teste de status SD1:', exportManager.getSDCardStatus(testDevices[0].sdCardInfo.sd1));
        console.log('✅ Teste de percentual SD1:', exportManager.getSDCardPercentage(testDevices[0].sdCardInfo.sd1));
        console.log('✅ Teste de canal 1:', exportManager.getChannelStatus(testDevices[0].systemInfo.channels, 1));
        console.log('✅ Teste de comparação firmware:', exportManager.getFirmwareComparisonText(testDevices[0].firmwareComparison));
        
        // Simular exportação CSV (sem download)
        const headers = [
            'IMEI', 'Status', 'Firmware', 'Voltagem', 'SD1 Usado (%)', 'Canal 1'
        ];
        
        const csvData = testDevices.map(device => [
            device.imei,
            device.isOnline ? 'Online' : 'Offline',
            device.firmwareVersion,
            exportManager.extractVoltage(device),
            exportManager.getSDCardPercentage(device.sdCardInfo?.sd1),
            exportManager.getChannelStatus(device.systemInfo?.channels, 1)
        ]);
        
        console.log('\n📋 Preview CSV:');
        console.log('Headers:', headers.join(', '));
        csvData.forEach((row, index) => {
            console.log(`Linha ${index + 1}:`, row.join(', '));
        });
        
        console.log('✅ Exportação CSV testada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste CSV:', error);
    }
}

// Função para testar exportação JSON
function testJSONExport() {
    console.log('\n🔧 Testando exportação JSON...');
    
    try {
        const exportManager = new ExportManager();
        
        // Testar criação do objeto JSON
        const jsonStructure = {
            metadata: {
                total_devices: testDevices.length,
                online_devices: testDevices.filter(d => d.isOnline).length
            },
            devices: testDevices.slice(0, 1).map(device => ({
                imei: device.imei,
                status: {
                    is_online: device.isOnline,
                    offline_days: device.offlineDays
                },
                storage: {
                    sd1: exportManager.getStorageObject(device.sdCardInfo?.sd1),
                    sd2: exportManager.getStorageObject(device.sdCardInfo?.sd2)
                },
                channels: exportManager.getChannelsObject(device.systemInfo?.channels)
            }))
        };
        
        console.log('📋 Preview JSON:', JSON.stringify(jsonStructure, null, 2));
        console.log('✅ Exportação JSON testada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste JSON:', error);
    }
}

// Executar testes
if (typeof ExportManager !== 'undefined') {
    testCSVExport();
    testJSONExport();
} else {
    console.log('❌ ExportManager não encontrado. Execute este teste no navegador após carregar o sistema.');
}
