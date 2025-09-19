"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CaptchaSecurity } from "@/lib/security/captcha"

interface CaptchaComponentProps {
  onVerify: (isValid: boolean, token?: string) => void
  identifier: string
  className?: string
}

export function CaptchaComponent({ onVerify, identifier, className = "" }: CaptchaComponentProps) {
  const [captcha, setCaptcha] = useState<{ question: string; answer: string } | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [cooldownTime, setCooldownTime] = useState(0)

  useEffect(() => {
    generateNewCaptcha()
    checkCooldown()
  }, [identifier])

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [cooldownTime])

  const generateNewCaptcha = () => {
    const newCaptcha = CaptchaSecurity.generateSimpleCaptcha()
    setCaptcha(newCaptcha)
    setUserAnswer("")
    setError("")
  }

  const checkCooldown = () => {
    if (CaptchaSecurity.isInCooldown(identifier)) {
      const cooldown = CaptchaSecurity.getCooldownTime(identifier)
      setCooldownTime(Math.ceil(cooldown / 1000))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captcha || !userAnswer.trim()) {
      setError("Por favor, responda a pergunta")
      return
    }

    if (cooldownTime > 0) {
      setError(`Aguarde ${cooldownTime} segundos antes de tentar novamente`)
      return
    }

    setIsLoading(true)
    setError("")

    // Simular verificação
    const isCorrect = userAnswer.trim() === captcha.answer

    if (isCorrect) {
      CaptchaSecurity.recordAttempt(identifier, true)
      const token = Buffer.from(captcha.answer).toString("base64")
      onVerify(true, token)
    } else {
      CaptchaSecurity.recordAttempt(identifier, false)
      setError("Resposta incorreta. Tente novamente.")
      generateNewCaptcha()
      checkCooldown()
      onVerify(false)
    }

    setIsLoading(false)
  }

  if (cooldownTime > 0) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-yellow-800 font-medium">Muitas tentativas incorretas</p>
          <p className="text-yellow-600 text-sm mt-1">Aguarde {cooldownTime} segundos para tentar novamente</p>
          <div className="mt-2 bg-yellow-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${((CaptchaSecurity.getCooldownTime(identifier) / 1000 - cooldownTime) / (CaptchaSecurity.getCooldownTime(identifier) / 1000)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!captcha) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-lg" />
  }

  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="captcha-answer" className="text-sm font-medium text-blue-900">
            Verificação de Segurança
          </Label>
          <p className="text-blue-800 font-semibold mt-1">{captcha.question}</p>
        </div>

        <div className="flex gap-2">
          <Input
            id="captcha-answer"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Digite sua resposta"
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !userAnswer.trim()} className="px-4">
            {isLoading ? "Verificando..." : "Verificar"}
          </Button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateNewCaptcha}
          className="text-blue-600 hover:text-blue-800"
        >
          Gerar nova pergunta
        </Button>
      </form>
    </div>
  )
}
