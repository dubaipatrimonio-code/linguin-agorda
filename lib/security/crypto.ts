import bcrypt from "bcryptjs"
import crypto from "crypto"

export class PasswordSecurity {
  private static readonly SALT_ROUNDS = 12

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS)
    return bcrypt.hash(password, salt)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex")
  }
}

export class DataEncryption {
  private static readonly ALGORITHM = "aes-256-gcm"
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16

  static encrypt(text: string, key: string): { encrypted: string; iv: string; tag: string } {
    const keyBuffer = crypto.scryptSync(key, "salt", this.KEY_LENGTH)
    const iv = crypto.randomBytes(this.IV_LENGTH)
    const cipher = crypto.createCipher(this.ALGORITHM, keyBuffer)
    cipher.setAAD(Buffer.from("additional-data"))

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    }
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
    const keyBuffer = crypto.scryptSync(key, "salt", this.KEY_LENGTH)
    const decipher = crypto.createDecipher(this.ALGORITHM, keyBuffer)
    decipher.setAAD(Buffer.from("additional-data"))
    decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"))

    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }
}
