import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(req: Request) {
  const { userId } = await req.json()

  if (!userId)
    return NextResponse.json({ error: "User ID mancante" }, { status: 400 })

  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
