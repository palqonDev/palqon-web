"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking")
  const supabase = createClientComponentClient()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data?.user?.id || null)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!bookingId || !userId) return

    const confirmAndClear = async () => {
      try {
        await fetch("/api/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })
        await fetch("/api/cart/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        setStatus("success")
      } catch {
        setStatus("error")
      }
    }

    confirmAndClear()
  }, [bookingId, userId])

  if (status === "loading") return <p>Conferma del pagamento in corso...</p>

  if (status === "error")
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-3">
          Errore durante la conferma
        </h1>
        <p>Il pagamento è riuscito ma non siamo riusciti ad aggiornare la prenotazione.</p>
        <Link href="/" className="text-blue-500 underline">Torna alla Home</Link>
      </div>
    )

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-green-500 mb-3">Pagamento completato!</h1>
      <p>La tua prenotazione è stata confermata e il carrello svuotato.</p>
      <Link href="/bookings" className="text-blue-500 underline">Vai alle mie prenotazioni</Link>
    </div>
  )
}
