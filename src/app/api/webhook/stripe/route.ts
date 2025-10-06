import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Readable } from "node:stream"
import { createClient } from "@supabase/supabase-js"

// 🚫 Disattiva il body parser di Next.js per ottenere il body RAW richiesto da Stripe
export const config = {
  api: {
    bodyParser: false,
  },
}

// ✅ Inizializza Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// ✅ Inizializza client Supabase con chiave di servizio (serve per scrivere nel DB)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 🔧 Helper per leggere il corpo grezzo della richiesta
async function buffer(readable: Readable) {
  const chunks: any[] = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

// 📦 Gestione POST (ricezione eventi Stripe)
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    console.error("❌ Nessuna firma Stripe trovata nell'header")
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // ✅ Legge il body grezzo e verifica la firma
    const buf = await buffer(req.body as unknown as Readable)
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    // ✅ Identifica l'evento Stripe
    const eventType = event.type
    console.log("✅ Ricevuto evento Stripe:", eventType)

    let bookingId: string | null = null

    // Legge bookingId da metadata della sessione o del payment intent
    if (eventType === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      bookingId = session.metadata?.bookingId || null
    } else if (eventType === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent
      bookingId = intent.metadata?.bookingId || null
    }

    console.log("📦 bookingId:", bookingId)

    if (!bookingId) {
      console.warn("⚠️ Nessun bookingId presente nei metadata")
      return NextResponse.json({ received: true })
    }

    // ✅ Aggiorna la prenotazione in Supabase
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "confirmed",
        last_payment_status: "paid",
      })
      .eq("id", bookingId)

    if (error) {
      console.error("❌ Errore aggiornamento booking:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ Booking aggiornato a 'confirmed' e 'paid' con successo")

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("❌ Errore nel webhook:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
