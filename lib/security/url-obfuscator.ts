import crypto from "crypto"

export class URLObfuscator {
  private static readonly SECRET_KEY = process.env.URL_SECRET_KEY || "change-this-secret-key-in-production"
  private static urlMappings: Map<string, string> = new Map()

  static generateSecureURL(originalPath: string, expirationMinutes = 60): string {
    const timestamp = Date.now()
    const expiration = timestamp + expirationMinutes * 60 * 1000

    // Criar hash único baseado no path, timestamp e chave secreta
    const hash = crypto
      .createHmac("sha256", this.SECRET_KEY)
      .update(`${originalPath}-${timestamp}-${expiration}`)
      .digest("hex")
      .substring(0, 16)

    // Gerar ID único
    const uniqueId = crypto.randomBytes(8).toString("hex")

    // URL ofuscada
    const obfuscatedPath = `/s/${hash}${uniqueId}`

    // Armazenar mapeamento temporário
    this.urlMappings.set(
      obfuscatedPath,
      JSON.stringify({
        originalPath,
        expiration,
        timestamp,
      }),
    )

    return obfuscatedPath
  }

  static resolveSecureURL(obfuscatedPath: string): string | null {
    const mapping = this.urlMappings.get(obfuscatedPath)

    if (!mapping) {
      return null
    }

    try {
      const { originalPath, expiration } = JSON.parse(mapping)

      // Verificar se não expirou
      if (Date.now() > expiration) {
        this.urlMappings.delete(obfuscatedPath)
        return null
      }

      return originalPath
    } catch {
      return null
    }
  }

  // Gerar URLs para endpoints críticos
  static generateCriticalEndpoints() {
    return {
      adminPanel: this.generateSecureURL("/admin/dashboard", 120),
      paymentCallback: this.generateSecureURL("/api/payment/callback", 30),
      userManagement: this.generateSecureURL("/admin/users", 60),
      securityLogs: this.generateSecureURL("/admin/security/logs", 30),
      backupRestore: this.generateSecureURL("/admin/backup", 15),
    }
  }

  // Limpeza automática de URLs expiradas
  static cleanupExpiredURLs(): void {
    const now = Date.now()

    for (const [path, mapping] of this.urlMappings.entries()) {
      try {
        const { expiration } = JSON.parse(mapping)
        if (now > expiration) {
          this.urlMappings.delete(path)
        }
      } catch {
        this.urlMappings.delete(path)
      }
    }
  }
}
