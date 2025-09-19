"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PaymentSuccess() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      router.push("/")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Realizado!</h1>

        <p className="text-gray-600 mb-6">Seu pedido foi confirmado e será preparado em breve.</p>

        <div className="text-sm text-gray-500">Você será redirecionado automaticamente em alguns segundos...</div>
      </div>
    </div>
  )
}
