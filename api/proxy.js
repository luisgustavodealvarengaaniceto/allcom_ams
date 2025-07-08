// Vercel Serverless Function - Proxy para API JimiCloud
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    
    // Responder a OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Verificar se é POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método não permitido' });
        return;
    }

    try {
        const { imeis, token } = req.body;

        if (!imeis || !Array.isArray(imeis) || imeis.length === 0) {
            res.status(400).json({ error: 'Lista de IMEIs é obrigatória' });
            return;
        }

        if (!token) {
            res.status(400).json({ error: 'Token de autenticação é obrigatório' });
            return;
        }

        // Importar fetch dinamicamente
        const fetch = (await import('node-fetch')).default;

        // Fazer requisição para a API JimiCloud
        const response = await fetch('http://fota-api.jimicloud.com/queryDeviceStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                imeis: imeis
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Retornar os dados
        res.status(200).json(data);

    } catch (error) {
        console.error('Erro no proxy:', error);
        
        if (error.name === 'AbortError') {
            res.status(408).json({ error: 'Timeout na requisição' });
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            res.status(503).json({ error: 'Serviço temporariamente indisponível' });
        } else {
            res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
        }
    }
};
