// Diagnóstico completo da API
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const diagnostics = {
        status: "✅ FUNCIONANDO",
        timestamp: new Date().toISOString(),
        environment: {
            node_version: process.version,
            platform: process.platform,
            arch: process.arch,
            memory_usage: process.memoryUsage(),
            uptime: process.uptime()
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            query: req.query,
            user_agent: req.headers['user-agent']
        },
        vercel: {
            region: process.env.VERCEL_REGION || 'unknown',
            env: process.env.NODE_ENV || 'unknown'
        }
    };
    
    res.status(200).json(diagnostics);
};
