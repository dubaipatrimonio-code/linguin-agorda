export class CaptchaSecurity {
  private static attempts: Map<string, number> = new Map()
  private static cooldowns: Map<string, number> = new Map()

  static requiresCaptcha(identifier: string): boolean {
    const attempts = this.attempts.get(identifier) || 0
    return attempts >= 2 // Exigir captcha após 2 tentativas
  }

  static getCooldownTime(identifier: string): number {
    const attempts = this.attempts.get(identifier) || 0
    if (attempts < 3) return 0

    // Cooldown progressivo: 30s, 60s, 120s, 300s
    const cooldownTimes = [0, 0, 30000, 60000, 120000, 300000]
    return cooldownTimes[Math.min(attempts, cooldownTimes.length - 1)]
  }

  static isInCooldown(identifier: string): boolean {
    const cooldownUntil = this.cooldowns.get(identifier)
    if (!cooldownUntil) return false

    if (Date.now() < cooldownUntil) {
      return true
    }

    this.cooldowns.delete(identifier)
    return false
  }

  static recordAttempt(identifier: string, success: boolean) {
    if (success) {
      this.attempts.delete(identifier)
      this.cooldowns.delete(identifier)
    } else {
      const currentAttempts = this.attempts.get(identifier) || 0
      const newAttempts = currentAttempts + 1
      this.attempts.set(identifier, newAttempts)

      const cooldownTime = this.getCooldownTime(identifier)
      if (cooldownTime > 0) {
        this.cooldowns.set(identifier, Date.now() + cooldownTime)
      }
    }
  }

  static generateSimpleCaptcha(): { question: string; answer: string } {
    const operations = ["+", "-", "*"]
    const operation = operations[Math.floor(Math.random() * operations.length)]

    let num1: number, num2: number, answer: number

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 20) + 1
        num2 = Math.floor(Math.random() * 20) + 1
        answer = num1 + num2
        break
      case "-":
        num1 = Math.floor(Math.random() * 20) + 10
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 - num2
        break
      case "*":
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 * num2
        break
      default:
        num1 = 5
        num2 = 3
        answer = 8
    }

    return {
      question: `Quanto é ${num1} ${operation} ${num2}?`,
      answer: answer.toString(),
    }
  }
}
