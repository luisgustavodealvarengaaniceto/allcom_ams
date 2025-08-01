// Teste simples da função serverless
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    res.status(200).json({ 
        message: 'Proxy funcionando!', 
        method: req.method,
        timestamp: new Date().toISOString(),
        url: req.url,
        headers: req.headers
    });
};
