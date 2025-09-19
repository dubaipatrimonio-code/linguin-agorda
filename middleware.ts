import { type NextRequest, NextResponse } from "next/server"
import RateLimiter from "./lib/security/rate-limiter"
import { SecurityLogger } from "./lib/security/logger"

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const url = request.nextUrl.pathname

  // Log de acesso
  SecurityLogger.log(
    "INFO",
    "REQUEST",
    {
      url,
      method: request.method,
      userAgent,
    },
    ip,
    userAgent,
  )

  // Rate limiting
  const rateLimiter = RateLimiter.getInstance()
  const rateLimit = rateLimiter.checkRateLimit(ip)

  if (!rateLimit.allowed) {
    SecurityLogger.log(
      "WARNING",
      "RATE_LIMIT_EXCEEDED",
      {
        url,
        remaining: rateLimit.remaining,
      },
      ip,
      userAgent,
    )

    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": rateLimit.resetTime.toString(),
        "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
      },
    })
  }

  // Headers de segurança
  const response = NextResponse.next()

  // HTTPS e HSTS
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // CSP para prevenir XSS
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.utmify.com.br https://static.hotjar.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none';",
  )

  // Rate limit headers
  response.headers.set("X-RateLimit-Limit", "5")
  response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString())
  response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString())

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
