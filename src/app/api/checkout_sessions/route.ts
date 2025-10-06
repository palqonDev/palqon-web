import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const { bookingId, amount } = await req.json()

    if (!amount || !bookingId) {
      return NextResponse.json(
        { error: "Dati mancanti per creare la sessione di pagamento" },
        { status: 400 }
      )
    }

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
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?booking=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
      metadata: { bookingId },
    })

    // ✅ Restituisce la URL corretta per il redirect
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Errore creazione checkout session:", err.message)
    return NextResponse.json(
      { error: "Errore durante la creazione della sessione di pagamento" },
      { status: 500 }
    )
  }
}
