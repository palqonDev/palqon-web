import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: "userId mancante" }, { status: 400 })
  }

  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (error) {
    console.error("❌ Errore svuotamento carrello:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`🧹 Carrello svuotato per user_id ${userId}`)
  return NextResponse.json({ success: true })
}
