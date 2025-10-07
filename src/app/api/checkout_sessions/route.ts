import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const { bookingId, amount, componentId } = await req.json()

    console.log("Checkout request:", { bookingId, amount, componentId })

    // Controllo parametri
    if (!amount || !bookingId || !componentId) {
      return NextResponse.json(
        { error: "Dati mancanti per creare la sessione" },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.palqon.com"

    // ✅ Crea sessione Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Prenotazione PalqOn" },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?booking=${bookingId}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        bookingId,
        componentId, // 👈 aggiunto per poterlo usare nel webhook o nel success handler
      },
      payment_intent_data: {
        metadata: {
          bookingId,
          componentId, // 👈 doppia sicurezza anche qui
        },
      },
    })

    console.log("✅ Checkout session created:", session.url)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("❌ Errore creazione checkout session:", err.message)
    return NextResponse.json(
      { error: "Errore durante la creazione della sessione di pagamento" },
      { status: 500 }
    )
  }
}
