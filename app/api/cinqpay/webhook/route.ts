import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] CinqPay webhook received:", body)

    // Aqui você pode processar os webhooks do CinqPay
    // Por exemplo: atualizar status do pedido, enviar confirmação, etc.

    const { event, data } = body

    switch (event) {
      case "payment.approved":
        console.log("[v0] Payment approved:", data.id)
        // Processar pagamento aprovado
        break

      case "payment.cancelled":
        console.log("[v0] Payment cancelled:", data.id)
        // Processar pagamento cancelado
        break

      case "payment.expired":
        console.log("[v0] Payment expired:", data.id)
        // Processar pagamento expirado
        break

      default:
        console.log("[v0] Unknown webhook event:", event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ success: false, error: "Erro ao processar webhook" }, { status: 500 })
  }
}
