import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Readable } from "node:stream"
import { createClient } from "@supabase/supabase-js"

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function buffer(readable: Readable) {
  const chunks: any[] = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  if (!sig)
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    const buf = await buffer(req.body as unknown as Readable)
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  try {
    const eventType = event.type
    console.log("✅ Evento Stripe:", eventType)

    let bookingId: string | null = null
    let componentId: string | null = null

    // ✅ Legge metadata (arrivano da checkout_sessions)
    if (eventType === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      bookingId = session.metadata?.bookingId || null
      componentId = session.metadata?.componentId || null
    } else if (eventType === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent
      bookingId = intent.metadata?.bookingId || null
      componentId = intent.metadata?.componentId || null
    }

    console.log("📦 bookingId:", bookingId)
    console.log("🎛 componentId:", componentId)

    if (!bookingId) {
      console.warn("⚠️ Nessun bookingId presente nei metadata")
      return NextResponse.json({ received: true })
    }

    // ✅ Aggiorna la prenotazione come pagata
    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "confirmed",
        last_payment_status: "paid",
      })
      .eq("id", bookingId)

    if (bookingUpdateError) {
      console.error("❌ Errore aggiornamento booking:", bookingUpdateError.message)
      return NextResponse.json({ error: bookingUpdateError.message }, { status: 500 })
    }

    console.log("✅ Booking aggiornato a 'confirmed' e 'paid'")

    // ✅ Inserisce il componente collegato
    if (componentId) {
      const { error: insertError } = await supabaseAdmin
        .from("booking_components")
        .insert([
          {
            booking_id: bookingId,
            component_id: componentId,
            quantity: 1,
          },
        ])

      if (insertError) {
        console.error("❌ Errore inserimento booking_components:", insertError.message)
      } else {
        console.log("✅ booking_components inserito:", { bookingId, componentId })
      }
    } else {
      console.warn("⚠️ Nessun componentId nei metadata, skip inserimento booking_components")
    }

    // ✅ Svuota il carrello dell’utente
    const { data: bookingRow, error: bookingFetchError } = await supabaseAdmin
      .from("bookings")
      .select("client_id")
      .eq("id", bookingId)
      .single()

    if (bookingFetchError) {
      console.error("Errore recupero client_id:", bookingFetchError)
    } else if (bookingRow?.client_id) {
      const { error: cartError } = await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("user_id", bookingRow.client_id)

      if (cartError)
        console.error("❌ Errore svuotamento carrello:", cartError.message)
      else
        console.log(`🧹 Carrello svuotato per user_id ${bookingRow.client_id}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("❌ Errore nel webhook:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
