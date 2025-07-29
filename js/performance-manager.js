// Performance Enhancements - Circuit Breaker e Retry Logic
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.failureThreshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }

    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
}

// Enhanced Retry Logic
class RetryManager {
    static async executeWithRetry(operation, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) {
                    break;
                }

                // Exponential backoff with jitter
                const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.log(`Tentativa ${attempt} falhou, aguardando ${Math.round(delay)}ms...`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw lastError;
    }
}

// Batch Processing Manager
class BatchManager {
    constructor(batchSize = 100) {
        this.batchSize = batchSize;
    }

    createBatches(items) {
        const batches = [];
        
        for (let i = 0; i < items.length; i += this.batchSize) {
            batches.push(items.slice(i, i + this.batchSize));
        }
        
        return batches;
    }

    async processBatchesWithProgress(batches, processor, onProgress) {
        const results = [];
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const progress = ((i + 1) / batches.length) * 100;
            
            onProgress(progress, `Processando lote ${i + 1} de ${batches.length}...`);
            
            try {
                const batchResult = await processor(batch, i + 1);
                results.push(...batchResult);
            } catch (error) {
                console.error(`Erro no lote ${i + 1}:`, error);
                onProgress(progress, `Erro no lote ${i + 1}: ${error.message}`);
            }
        }
        
        return results;
    }
}

// Performance Manager - Sistema completo de gerenciamento de performance
class PerformanceManager {
    constructor() {
        // Circuit breaker mais permissivo para o contexto de consulta de IMEI
        this.circuitBreaker = new CircuitBreaker(10, 300000); // 10 falhas, 5 minutos timeout
        this.batchManager = new BatchManager();
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastReset: Date.now()
        };
        
        console.log('✅ Performance Manager initialized with relaxed circuit breaker (10 failures, 5min timeout)');
    }

    // Check if can make request (circuit breaker)
    canMakeRequest() {
        return this.circuitBreaker.state !== 'OPEN';
    }

    // Execute with retry logic
    async executeWithRetry(operation, maxRetries = 3) {
        return await this.circuitBreaker.execute(operation, maxRetries);
    }

    // Record successful request
    recordSuccess() {
        this.stats.totalRequests++;
        this.stats.successfulRequests++;
        this.circuitBreaker.onSuccess();
    }

    // Record failed request
    recordFailure() {
        this.stats.totalRequests++;
        this.stats.failedRequests++;
        this.circuitBreaker.onFailure();
    }

    // Get circuit breaker state
    getCircuitBreakerState() {
        return {
            state: this.circuitBreaker.state,
            failureCount: this.circuitBreaker.failureCount,
            lastFailureTime: this.circuitBreaker.lastFailureTime
        };
    }

    // Get performance statistics
    getPerformanceStats() {
        const failureRate = this.stats.totalRequests > 0 ? 
            this.stats.failedRequests / this.stats.totalRequests : 0;
        const successRate = this.stats.totalRequests > 0 ? 
            this.stats.successfulRequests / this.stats.totalRequests : 0;

        return {
            ...this.stats,
            failureRate,
            successRate,
            circuitBreakerState: this.circuitBreaker.state
        };
    }

    // Reset statistics
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastReset: Date.now()
        };
        console.log('📊 Performance stats reset');
    }

    // Process in batches
    async processBatches(items, batchSize, processor, onProgress) {
        return await this.batchManager.processBatches(items, batchSize, processor, onProgress);
    }
}

// Export instances
const circuitBreaker = new CircuitBreaker();
const batchManager = new BatchManager();

// Export classes for use in main app
if (typeof window !== 'undefined') {
    window.PerformanceManager = PerformanceManager;
    window.CircuitBreaker = CircuitBreaker;
    window.BatchManager = BatchManager;
}
