import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

// Inizializza Stripe con chiave live
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!
  const body = await req.text()

  let event: Stripe.Event
  try {
    // Verifica la firma del webhook
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    // Gestisci eventi di pagamento completato
    if (
      event.type === "checkout.session.completed" ||
      event.type === "payment_intent.succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      if (bookingId) {
        const paymentIntent = session.payment_intent?.toString()
        const amount = session.amount_total ? session.amount_total / 100 : null

        await supabaseAdmin
          .from("bookings")
          .update({
            status: "confirmed",
            last_payment_status: "paid",
            deposit_paid: amount,
            setup_intent_id: paymentIntent,
          })
          .eq("id", bookingId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Webhook processing error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
