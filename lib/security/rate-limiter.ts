interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
  blockUntil?: number
}

class RateLimiter {
  private static instance: RateLimiter
  private requests: Map<string, RateLimitEntry> = new Map()
  private readonly MAX_REQUESTS = 5
  private readonly WINDOW_MS = 10000 // 10 segundos
  private readonly BLOCK_DURATION_MS = 300000 // 5 minutos de bloqueio

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.requests.get(ip)

    // Verificar se IP está bloqueado
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      return { allowed: false, remaining: 0, resetTime: entry.blockUntil }
    }

    // Resetar contador se janela expirou
    if (!entry || now > entry.resetTime) {
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.WINDOW_MS,
        blocked: false,
      })
      return { allowed: true, remaining: this.MAX_REQUESTS - 1, resetTime: now + this.WINDOW_MS }
    }

    // Incrementar contador
    entry.count++

    // Bloquear se excedeu limite
    if (entry.count > this.MAX_REQUESTS) {
      entry.blocked = true
      entry.blockUntil = now + this.BLOCK_DURATION_MS
      this.logSuspiciousActivity(ip, "RATE_LIMIT_EXCEEDED")
      return { allowed: false, remaining: 0, resetTime: entry.blockUntil }
    }

    return {
      allowed: true,
      remaining: this.MAX_REQUESTS - entry.count,
      resetTime: entry.resetTime,
    }
  }

  private logSuspiciousActivity(ip: string, reason: string) {
    console.log(`[SECURITY ALERT] ${new Date().toISOString()} - IP: ${ip} - Reason: ${reason}`)
    // Aqui você pode integrar com sistema de alertas
  }

  // Limpar entradas antigas periodicamente
  cleanup() {
    const now = Date.now()
    for (const [ip, entry] of this.requests.entries()) {
      if (now > entry.resetTime && (!entry.blocked || (entry.blockUntil && now > entry.blockUntil))) {
        this.requests.delete(ip)
      }
    }
  }
}

export default RateLimiter
