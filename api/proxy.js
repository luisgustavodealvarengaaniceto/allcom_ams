// Proxy para API JimiCloud - Versão Simplificada
module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Only POST allowed' });
        return;
    }

    try {
        const { imeis, token } = req.body || {};

        // Validation
        if (!imeis || !Array.isArray(imeis) || imeis.length === 0) {
            res.status(400).json({ error: 'IMEIs array required' });
            return;
        }

        if (!token) {
            res.status(400).json({ error: 'Token required' });
            return;
        }

        // Import fetch (works with both Node 18+ and older versions)
        let fetch;
        try {
            // Try native fetch first (Node 18+)
            fetch = globalThis.fetch;
        } catch {
            // Fallback to node-fetch
            fetch = require('node-fetch');
        }

        // API Request
        const response = await fetch('http://fota-api.jimicloud.com/queryDeviceStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ imeis })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};
