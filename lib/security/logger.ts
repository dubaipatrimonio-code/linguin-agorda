interface SecurityLog {
  timestamp: string
  level: "INFO" | "WARNING" | "CRITICAL"
  event: string
  ip?: string
  userAgent?: string
  userId?: string
  details: any
}

export class SecurityLogger {
  private static logs: SecurityLog[] = []
  private static readonly MAX_LOGS = 10000

  static log(
    level: SecurityLog["level"],
    event: string,
    details: any = {},
    ip?: string,
    userAgent?: string,
    userId?: string,
  ) {
    const logEntry: SecurityLog = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ip,
      userAgent,
      userId,
      details,
    }

    this.logs.push(logEntry)

    // Manter apenas os últimos logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.splice(0, this.logs.length - this.MAX_LOGS)
    }

    // Log no console para desenvolvimento
    console.log(`[SECURITY ${level}] ${logEntry.timestamp} - ${event}`, details)

    // Enviar alertas para eventos críticos
    if (level === "CRITICAL") {
      this.sendAlert(logEntry)
    }

    // Detectar padrões suspeitos
    this.detectSuspiciousPatterns(logEntry)
  }

  private static sendAlert(logEntry: SecurityLog) {
    // Em produção, integrar com sistema de alertas (email, Slack, etc.)
    console.error("🚨 ALERTA CRÍTICO DE SEGURANÇA:", logEntry)
  }

  private static detectSuspiciousPatterns(logEntry: SecurityLog) {
    if (!logEntry.ip) return

    // Detectar múltiplas tentativas de login falhadas
    const recentFailedLogins = this.logs.filter(
      (log) =>
        log.ip === logEntry.ip &&
        log.event === "LOGIN_FAILED" &&
        Date.now() - new Date(log.timestamp).getTime() < 300000, // últimos 5 minutos
    ).length

    if (recentFailedLogins >= 5) {
      this.log("CRITICAL", "SUSPICIOUS_LOGIN_PATTERN", {
        ip: logEntry.ip,
        failedAttempts: recentFailedLogins,
      })
    }

    // Detectar acessos a URLs sensíveis
    const sensitiveEndpoints = ["/api/admin", "/api/payment", "/api/user"]
    if (sensitiveEndpoints.some((endpoint) => logEntry.details.url?.includes(endpoint))) {
      this.log("WARNING", "SENSITIVE_ENDPOINT_ACCESS", {
        ip: logEntry.ip,
        url: logEntry.details.url,
      })
    }
  }

  static getLogs(level?: SecurityLog["level"], limit = 100): SecurityLog[] {
    let filteredLogs = this.logs

    if (level) {
      filteredLogs = this.logs.filter((log) => log.level === level)
    }

    return filteredLogs.slice(-limit).reverse()
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}
