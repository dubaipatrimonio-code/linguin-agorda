import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { amount, description, customer, items, payment_method, card_data } = body

  if (!amount || !customer || !customer.name) {
    return NextResponse.json({ success: false, error: "Dados obrigatórios não fornecidos" }, { status: 400 })
  }

  if (payment_method === "credit_card") {
    if (!card_data || !card_data.number || !card_data.expiry_date || !card_data.cvv || !card_data.holder_name) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão de crédito obrigatórios não fornecidos" },
        { status: 400 },
      )
    }
  }

  const generateUniqueHash = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `${timestamp}${random}`.substring(0, 12)
  }

  const cinqPayPayload = {
    amount: Math.round(amount * 100), // Convert to cents as required by CinqPay
    offer_hash: generateUniqueHash(), // Generate unique hash for each transaction
    payment_method: payment_method || "pix", // Default to PIX if not specified
    customer: {
      name: customer.name,
      email: customer.email || "cliente@email.com",
      phone_number: customer.phone || "11999999999",
      document: customer.cpf || "00000000000", // CPF obrigatório
      street_name: customer.address || "Rua Exemplo",
      number: customer.number || "123",
      complement: customer.complement || "",
      neighborhood: customer.neighborhood || "Centro",
      city: customer.city || "São Paulo",
      state: customer.state || "SP",
      zip_code: customer.zipCode || "01000000",
    },
    ...(payment_method === "credit_card" &&
      card_data && {
        card: {
          number: card_data.number.replace(/\s/g, ""), // Remove spaces
          expiry_date: card_data.expiry_date,
          cvv: card_data.cvv,
          holder_name: card_data.holder_name,
        },
      }),
    cart: items?.map((item: any, index: number) => ({
      product_hash: `prod_${generateUniqueHash()}_${index}`, // Generate unique product hash
      title: item.name || "Produto",
      cover: null,
      price: Math.round((item.unitPrice || item.totalPrice || amount) * 100),
      quantity: item.quantity || 1,
      operation_type: 1, // 1 = main sale
      tangible: false,
      product_id: index + 1,
      offer_id: 1,
    })) || [
      {
        product_hash: `prod_${generateUniqueHash()}_default`,
        title: description || "Pedido Burger Delivery",
        cover: null,
        price: Math.round(amount * 100),
        quantity: 1,
        operation_type: 1,
        tangible: false,
        product_id: 1,
        offer_id: 1,
      },
    ],
    installments: 1,
    expire_in_days: 1,
    transaction_origin: "api",
    tracking: {
      src: "",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_term: "",
      utm_content: "",
    },
    postback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cinqpay/webhook`,
  }

  console.log("[v0] Sending to CinqPay:", {
    ...cinqPayPayload,
    customer: { ...cinqPayPayload.customer, document: "[HIDDEN]" },
    ...(cinqPayPayload.card && { card: { ...cinqPayPayload.card, number: "[HIDDEN]", cvv: "[HIDDEN]" } }),
  })

  try {
    const endpoint = "https://api.cinqpay.com.br/api/public/v1/transactions"

    console.log(`[v0] Calling CinqPay API: ${endpoint}`)

    const response = await fetch(`${endpoint}?api_token=${process.env.CINQPAY_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(cinqPayPayload),
    })

    const responseData = await response.json()
    console.log("[v0] CinqPay full response:", JSON.stringify(responseData, null, 2))

    if (response.ok && responseData) {
      if (payment_method === "credit_card") {
        // Credit card payment response
        const transactionHash = responseData.hash || responseData.id
        const paymentId = responseData.id || responseData.payment_id
        const status = responseData.status || "pending"

        return NextResponse.json({
          success: true,
          payment_method: "credit_card",
          transaction_hash: transactionHash,
          payment_id: paymentId,
          status: status,
          amount: responseData.amount || Math.round(amount * 100),
          raw_response: responseData, // Para debug
        })
      } else {
        // PIX payment response
        let qrCode = null
        let pixCode = null
        let transactionHash = null
        let paymentId = null

        // A resposta vem com estrutura: responseData.pix.pix_qr_code
        if (responseData.pix) {
          qrCode = responseData.pix.pix_qr_code || responseData.pix.qr_code_base64
          pixCode = responseData.pix.pix_qr_code // O código PIX é o mesmo que o QR code em formato texto
          transactionHash = responseData.hash
          paymentId = responseData.id
        } else if (responseData.data) {
          // Fallback para estrutura com data wrapper
          const data = responseData.data
          qrCode = data.pix_qr_code || data.qr_code_image || data.qr_code
          pixCode = data.pix_copy_paste || data.pix_code || data.copy_paste
          transactionHash = data.hash || data.transaction_hash
          paymentId = data.id || data.payment_id
        } else {
          // Fallback para estrutura direta
          qrCode = responseData.pix_qr_code || responseData.qr_code_image || responseData.qr_code
          pixCode = responseData.pix_copy_paste || responseData.pix_code || responseData.copy_paste
          transactionHash = responseData.hash || responseData.transaction_hash || responseData.id
          paymentId = responseData.id || responseData.payment_id
        }

        console.log("[v0] Extracted payment data:", {
          hasQrCode: !!qrCode,
          hasPixCode: !!pixCode,
          qrCodeLength: qrCode?.length,
          pixCodeLength: pixCode?.length,
          transactionHash,
          paymentId,
        })

        if (!qrCode && !pixCode) {
          console.error("[v0] CinqPay não retornou QR code nem código PIX válidos")
          return NextResponse.json(
            {
              success: false,
              error: "CinqPay não retornou dados de pagamento PIX válidos. Verifique sua configuração.",
              debug: responseData,
            },
            { status: 400 },
          )
        }

        return NextResponse.json({
          success: true,
          payment_method: "pix",
          qr_code: qrCode,
          pix_code: pixCode,
          transaction_hash: transactionHash,
          payment_id: paymentId,
          expires_at: responseData.expires_at || responseData.data?.expires_at,
          status: responseData.status || responseData.data?.status || "pending",
          amount: responseData.amount || responseData.data?.amount || Math.round(amount * 100),
          raw_response: responseData, // Para debug
        })
      }
    } else {
      console.error("[v0] CinqPay error response:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: `CinqPay API error: ${responseData.message || responseData.error || "Unknown error"}`,
          details: responseData,
        },
        { status: response.status || 400 },
      )
    }
  } catch (error) {
    console.error("[v0] CinqPay request failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao conectar com CinqPay. Verifique sua conexão e tente novamente.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
