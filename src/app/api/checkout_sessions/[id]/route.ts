import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// GET /api/checkout_sessions/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id

  if (!sessionId) {
    return NextResponse.json({ error: "ID sessione mancante" }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total ? session.amount_total / 100 : null,
      customer_email: session.customer_details?.email || null,
      bookingId: session.metadata?.bookingId || null,
    })
  } catch (err: any) {
    console.error("Errore nel recupero della sessione:", err.message)
    return NextResponse.json(
      { error: "Errore durante il recupero della sessione Stripe" },
      { status: 500 }
    )
  }
}
