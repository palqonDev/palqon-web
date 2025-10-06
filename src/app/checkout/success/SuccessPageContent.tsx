"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import styles from "./Success.module.css"

export default function SuccessPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!sessionId) return
      try {
        const res = await fetch(`/api/checkout_sessions/${sessionId}`)
        if (!res.ok) throw new Error("Errore nel recupero dati")
        const data = await res.json()
        setDetails(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchDetails()
  }, [sessionId])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>✅ Pagamento completato</h2>
        <p>
          Il tuo pagamento è stato ricevuto con successo.  
          Riceverai un'email di conferma con i dettagli della prenotazione.
        </p>

        {details ? (
          <div className={styles.details}>
            <p><strong>Importo:</strong> € {(details.amount_total / 100).toFixed(2)}</p>
            <p><strong>Email:</strong> {details.customer_email}</p>
            <p><strong>Stato:</strong> {details.payment_status}</p>
          </div>
        ) : (
          <p>Caricamento dettagli pagamento...</p>
        )}

        <Link href="/profile" className={styles.btn}>
          Vai al tuo profilo
        </Link>
      </div>
    </div>
  )
}
