"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking")
  const supabase = createClientComponentClient()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [userId, setUserId] = useState<string | null>(null)

  // Recupera utente attuale da Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        console.error("Utente non autenticato:", error)
        setStatus("error")
      } else {
        setUserId(data.user.id)
      }
    }
    getUser()
  }, [])

  // Aggiorna booking e svuota carrello
  useEffect(() => {
    if (!bookingId || !userId) return

    const confirmAndClear = async () => {
      try {
        // 1️⃣ Aggiorna prenotazione
        const res1 = await fetch("/api/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })
        if (!res1.ok) throw new Error("Errore aggiornamento booking")

        // 2️⃣ Svuota carrello utente
        const res2 = await fetch("/api/cart/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        if (!res2.ok) throw new Error("Errore svuotamento carrello")

        setStatus("success")
      } catch (err) {
        console.error(err)
        setStatus("error")
      }
    }

    confirmAndClear()
  }, [bookingId, userId])

  // UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white text-center">
      {status === "loading" && <p>Conferma del pagamento in corso...</p>}
      {status === "success" && (
        <>
          <h1 className="text-3xl font-bold text-green-400 mb-4">
            Pagamento completato con successo!
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            La tua prenotazione è stata confermata e il carrello svuotato.
          </p>
          <Link
            href="/bookings"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Vai alle mie prenotazioni
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Errore durante la conferma
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Il pagamento è andato a buon fine, ma non siamo riusciti ad aggiornare
            la prenotazione o svuotare il carrello.
          </p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Torna alla home
          </Link>
        </>
      )}
    </div>
  )
}
