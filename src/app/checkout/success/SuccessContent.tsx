"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const confirmAndClear = async () => {
      try {
        console.log("✅ Booking ID ricevuto:", bookingId)
        if (!bookingId) throw new Error("Booking ID mancante")

        // ✅ Conferma prenotazione su Supabase
        const confirmRes = await fetch("/api/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })

        console.log("🔄 Risposta conferma:", confirmRes.status)

        // ✅ Svuota il carrello (non serve userId)
        const clearRes = await fetch("/api/cart/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })

        console.log("🧹 Risposta clear:", clearRes.status)

        if (!confirmRes.ok || !clearRes.ok)
          throw new Error("Errore backend durante la conferma o pulizia carrello")

        setStatus("success")
      } catch (err) {
        console.error("❌ Errore:", err)
        setStatus("error")
      }
    }

    confirmAndClear()
  }, [bookingId])

  if (status === "loading") return <p>Conferma del pagamento in corso...</p>

  if (status === "error")
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-3">
          Errore durante la conferma
        </h1>
        <p>
          Il pagamento è riuscito ma non siamo riusciti ad aggiornare la
          prenotazione.
        </p>
        <Link href="/" className="text-blue-500 underline">
          Torna alla Home
        </Link>
      </div>
    )

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-green-500 mb-3">
        Pagamento completato!
      </h1>
      <p>La tua prenotazione è stata confermata e il carrello svuotato.</p>
      <Link href="/profile" className="text-blue-500 underline">
        Vai al tuo profilo
      </Link>
    </div>
  )
}
