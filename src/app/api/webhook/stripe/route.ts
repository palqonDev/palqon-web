import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Readable } from "node:stream"
import { supabase } from "@/lib/supabaseClient"

export const config = {
  api: {
    bodyParser: false, // disabilita il parsing automatico
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Utility per leggere il body grezzo
async function buffer(readable: Readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const buf = await buffer(req.body as unknown as Readable)
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Gestione evento
  try {
    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      console.log("✅ Ricevuto evento Stripe:", event.type, "bookingId:", bookingId)

      if (bookingId) {
        const { error } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            last_payment_status: "paid",
            setup_intent_id: session.payment_intent?.toString(),
          })
          .eq("id", bookingId)

        if (error) {
          console.error("Errore aggiornamento booking:", error.message)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log("✅ Booking aggiornato a 'confirmed' e 'paid'")
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Errore nel webhook:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
