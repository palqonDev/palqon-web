import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    console.log("🧹 Pulizia carrello per booking:", bookingId)

    if (!bookingId)
      return NextResponse.json({ error: "bookingId mancante" }, { status: 400 })

    // Recupera client_id dal booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("client_id")
      .eq("id", bookingId)
      .single()

    if (fetchError || !booking)
      return NextResponse.json({ error: "Booking non trovato" }, { status: 404 })

    // Cancella tutti i cart_items per quell’utente
    const { error: delError } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("user_id", booking.client_id)

    if (delError) throw delError

    console.log(`✅ Carrello svuotato per user_id ${booking.client_id}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("❌ Errore svuotamento carrello:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
