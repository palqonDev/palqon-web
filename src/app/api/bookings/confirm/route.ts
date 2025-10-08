import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ✅ Crea client admin con chiave di servizio
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()

    // 🔍 LOG diagnostici
    console.log("📩 Body ricevuto:", bookingId)
    console.log("🔑 Service key presente:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log("🌐 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

    if (!bookingId) {
      console.error("❌ bookingId mancante nel body")
      return NextResponse.json({ error: "bookingId mancante" }, { status: 400 })
    }

    // ✅ Aggiorna stato prenotazione
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "confirmed",
        last_payment_status: "paid",
      })
      .eq("id", bookingId)
      .select()

    // 🔍 Log del risultato dell'update
    console.log("📦 Update result:", data, error)

    if (error) {
      console.error("❌ Errore update booking:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ Nessun booking trovato con quell'id.")
      return NextResponse.json({ error: "Booking non trovato" }, { status: 404 })
    }

    console.log("✅ Booking aggiornato con successo:", data[0].id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("❌ Errore generale conferma:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
