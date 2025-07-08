// Função de teste básica para Vercel
module.exports = (req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Resposta OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Resposta principal
    res.status(200).json({ 
        message: "✅ API Vercel funcionando!",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        status: "OK"
    });
};
