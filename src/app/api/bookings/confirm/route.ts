import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId mancante" }, { status: 400 })
    }

    // ✅ aggiorna stato prenotazione
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        last_payment_status: "paid",
      })
      .eq("id", bookingId)

    if (error) {
      console.error("Errore update booking:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ Booking confermato manualmente:", bookingId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Errore conferma booking:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
