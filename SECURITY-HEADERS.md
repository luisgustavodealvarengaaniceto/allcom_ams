# Oracle Cloud Security Configuration

## Cabeçalhos de Segurança Recomendados

Adicione estes cabeçalhos no servidor Oracle:

```
# Content Security Policy
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://fota-api.jimicloud.com

# X-Frame-Options
X-Frame-Options: DENY

# X-Content-Type-Options
X-Content-Type-Options: nosniff

# X-XSS-Protection
X-XSS-Protection: 1; mode=block

# Strict-Transport-Security (HTTPS only)
Strict-Transport-Security: max-age=31536000; includeSubDomains

# Referrer Policy
Referrer-Policy: strict-origin-when-cross-origin
```

## Configuração de CORS

Se usar proxy, configure CORS adequadamente:

```javascript
// No proxy-server.js
app.use(cors({
    origin: ['https://seu-dominio.oracle.com'],
    credentials: true
}));
```
