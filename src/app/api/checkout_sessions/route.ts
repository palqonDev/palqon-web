import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: Request) {
  try {
    const { bookingId, amount } = await req.json()

    if (!bookingId || !amount) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 })
    }

    // Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Prenotazione #${bookingId}` },
            unit_amount: Math.round(amount * 100), // centesimi
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?booking=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        bookingId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Errore creazione sessione Stripe:", err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
