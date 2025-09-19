import { PasswordSecurity } from "./crypto"

interface User {
  id: string
  email: string
  passwordHash: string
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  loginAttempts: number
  lockedUntil?: number
}

interface LoginAttempt {
  ip: string
  timestamp: number
  success: boolean
  userAgent: string
}

export class AuthSecurity {
  private static readonly MAX_LOGIN_ATTEMPTS = 3
  private static readonly LOCK_DURATION_MS = 900000 // 15 minutos
  private static loginAttempts: Map<string, LoginAttempt[]> = new Map()

  static async authenticateUser(
    email: string,
    password: string,
    ip: string,
    userAgent: string,
  ): Promise<{
    success: boolean
    user?: User
    requiresTwoFactor?: boolean
    message: string
  }> {
    // Verificar tentativas de login
    const attempts = this.getLoginAttempts(email)
    const recentFailedAttempts = attempts.filter(
      (attempt) => !attempt.success && Date.now() - attempt.timestamp < this.LOCK_DURATION_MS,
    ).length

    if (recentFailedAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      this.logSecurityEvent("ACCOUNT_LOCKED", { email, ip, userAgent })
      return { success: false, message: "Conta temporariamente bloqueada devido a múltiplas tentativas de login" }
    }

    // Simular busca do usuário (em produção, buscar do banco de dados)
    const user = await this.getUserByEmail(email)

    if (!user) {
      this.recordLoginAttempt(email, ip, userAgent, false)
      return { success: false, message: "Credenciais inválidas" }
    }

    const passwordValid = await PasswordSecurity.verifyPassword(password, user.passwordHash)

    if (!passwordValid) {
      this.recordLoginAttempt(email, ip, userAgent, false)
      return { success: false, message: "Credenciais inválidas" }
    }

    this.recordLoginAttempt(email, ip, userAgent, true)

    if (user.twoFactorEnabled) {
      return {
        success: true,
        user,
        requiresTwoFactor: true,
        message: "Código 2FA necessário",
      }
    }

    return { success: true, user, message: "Login realizado com sucesso" }
  }

  private static recordLoginAttempt(email: string, ip: string, userAgent: string, success: boolean) {
    const attempts = this.loginAttempts.get(email) || []
    attempts.push({
      ip,
      timestamp: Date.now(),
      success,
      userAgent,
    })

    // Manter apenas últimas 10 tentativas
    if (attempts.length > 10) {
      attempts.splice(0, attempts.length - 10)
    }

    this.loginAttempts.set(email, attempts)
  }

  private static getLoginAttempts(email: string): LoginAttempt[] {
    return this.loginAttempts.get(email) || []
  }

  private static async getUserByEmail(email: string): Promise<User | null> {
    // Em produção, buscar do banco de dados
    // Por enquanto, retorna null (usuário não encontrado)
    return null
  }

  private static logSecurityEvent(event: string, data: any) {
    console.log(`[SECURITY EVENT] ${new Date().toISOString()} - ${event}:`, data)
    // Integrar com sistema de alertas
  }
}
