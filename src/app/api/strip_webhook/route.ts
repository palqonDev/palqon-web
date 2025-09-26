import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/supabaseClient"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature error:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // 🔹 Gestione eventi principali
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const bookingId = session.metadata?.bookingId
      const amount = session.amount_total ? session.amount_total / 100 : 0

      if (bookingId) {
        // aggiorna booking in Supabase
        const { error } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            deposit_paid: amount,
            last_payment_status: "paid",
          })
          .eq("id", bookingId)

        if (error) {
          console.error("Errore update booking:", error.message)
        } else {
          console.log(`Booking ${bookingId} confermato con pagamento di €${amount}`)
        }
      }
    }

    if (event.type === "payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const bookingId = paymentIntent.metadata?.bookingId

      if (bookingId) {
        await supabase
          .from("bookings")
          .update({
            last_payment_status: "failed",
          })
          .eq("id", bookingId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Errore webhook:", err.message)
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 })
  }
}
