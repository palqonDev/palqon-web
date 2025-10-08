"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/supabaseClient"
import styles from "./CartPage.module.css"

type CartItem = {
  id: string
  component_id: string
  date_start: string
  date_end: string
  expires_at: string
  quantity: number
  component: {
    name: string
    description: string
    price_1day: number
    price_original?: number
    images: string[]
    type: string
    indoor: boolean
    outdoor: boolean
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())

  // fetch carrello
  useEffect(() => {
    const fetchCart = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          component_id,
          date_start,
          date_end,
          expires_at,
          quantity,
          component:components (
            name, description, price_1day, price_original,
            images, type, indoor, outdoor
          )
        `
        )
        .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())

      if (error) {
        console.error("Errore fetch cart:", error)
      } else {
        setCartItems(data || [])
      }
      setLoading(false)
    }

    fetchCart()
  }, [router])

  // aggiorna clock per countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  // calcolo prezzo item
  const calculateItemTotal = (item: CartItem) => {
    const start = new Date(item.date_start)
    const end = new Date(item.date_end)
    const days =
      start.toDateString() === end.toDateString()
        ? 1
        : Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return (item.component.price_1day * days * item.quantity).toFixed(2)
  }

  // totale carrello
  const calculateCartTotal = () =>
    cartItems.reduce((sum, item) => sum + Number(calculateItemTotal(item)), 0).toFixed(2)

  // countdown residuo
  const formatRemaining = (expires_at: string) => {
    const diff = new Date(expires_at).getTime() - now
    if (diff <= 0) return "00:00"
    const mins = Math.floor(diff / 1000 / 60)
    const secs = Math.floor((diff / 1000) % 60)
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${pad(mins)}:${pad(secs)}`
  }

  // rimozione item singolo
  const handleRemoveItem = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id)
    setCartItems((prev) => prev.filter((ci) => ci.id !== id))
  }

// conferma checkout (multi-component)
const handleCheckout = async () => {
  try {
    if (!cartItems.length) {
      alert("Carrello vuoto.")
      return
    }

    // 1️⃣ Crea prenotazione preliminare
    const total = calculateCartTotal()

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          client_id: user.id,
          seller_id: cartItems[0].component?.seller_id || null, // opzionale
          total_price: total,
          date_start: cartItems[0].date_start,
          date_end: cartItems[0].date_end,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (bookingError) {
      alert("Errore creazione booking: " + bookingError.message)
      return
    }

    const bookingId = booking.id

// 2️⃣ Collega i componenti del carrello senza duplicati
const uniqueItems = Array.from(
  new Map(
    cartItems.map((item) => [`${item.component_id}-${item.date_start}-${item.date_end}`, item])
  ).values()
)

const componentLinks = uniqueItems.map((item) => ({
  booking_id: bookingId,
  component_id: item.component_id,
  quantity: item.quantity,
}))

for (const link of componentLinks) {
  const { data: existing } = await supabase
    .from("booking_components")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("component_id", link.component_id)
    .maybeSingle()

  if (!existing) {
    const { error: insertError } = await supabase
      .from("booking_components")
      .insert([link])

    if (insertError) {
      console.error("Errore inserimento booking_components:", insertError)
      alert("Errore creazione legami componenti: " + insertError.message)
      return
    }
  }
}


    // 3️⃣ Invia richiesta al backend per creare sessione Stripe
    //    (invia il primo componentId come riferimento principale)
    const componentId = cartItems[0].component_id

    console.log("DEBUG checkout payload:", { bookingId, total, componentId })

    const res = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        amount: total,
        componentId,
      }),
    })

    const data = await res.json()
    console.log("Checkout data:", data)

    if (!res.ok || !data.url) {
      alert("Errore checkout: " + JSON.stringify(data))
      return
    }

    // 4️⃣ Redirect a Stripe Checkout
    window.location.href = data.url
  } catch (error: any) {
    console.error("Errore generale nel checkout:", error)
    alert("Errore durante la procedura di checkout.")
  }
}





  if (loading) return <p className={styles.container}>Caricamento...</p>
  if (cartItems.length === 0)
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Il tuo carrello</h1>
        <p className={styles.empty}>Nessun articolo nel carrello.</p>
        <Link href="/" className={styles.backBtn}>
          Continua gli acquisti
        </Link>
      </div>
    )

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Il tuo carrello</h1>
      <div className={styles.grid}>
        {cartItems.map((item) => (
          <div key={item.id} className={styles.cartCard}>
            {/* countdown badge */}
            <div className={styles.countdownBadge}>
              ⏳ {formatRemaining(item.expires_at)}
            </div>

            {/* pulsante rimozione */}
            <button
              className={styles.removeBtn}
              onClick={() => handleRemoveItem(item.id)}
            >
              ✕
            </button>

            {/* griglia interna */}
            <div className={styles.cardGrid}>
              {/* immagine */}
              <div className={styles.imageWrapper}>
                {item.component.images?.length > 0 ? (
                  <img
                    src={item.component.images[0]}
                    alt={item.component.name}
                    className={styles.componentImg}
                  />
                ) : (
                  <span className={styles.placeholder}>Nessuna immagine</span>
                )}
              </div>

              {/* info */}
              <div className={styles.infoColumn}>
                <h2 className={styles.componentTitle}>{item.component.name}</h2>
                <p className={styles.label}>
                  Dal:{" "}
                  <span className={styles.value}>
                    {new Date(item.date_start).toLocaleDateString()}
                  </span>
                </p>
                <p className={styles.label}>
                  Al:{" "}
                  <span className={styles.value}>
                    {new Date(item.date_end).toLocaleDateString()}
                  </span>
                </p>
                <p className={styles.description}>
                  {item.component.description || "Nessuna descrizione"}
                </p>
              </div>

              {/* prezzo */}
              <div className={styles.priceColumn}>
                <span className={styles.discountedPrice}>
                   € {calculateItemTotal(item)}
                </span>
                <span className={styles.priceNote}>IVA inclusa</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totale carrello e azioni */}
      <div className={styles.summary}>
        <p className={styles.summaryText}>
          Totale carrello: <strong>€ {calculateCartTotal()}</strong>
        </p>
        <div className={styles.actions}>
<Link href="/components" className={styles.continueBtn}>
  Continua gli acquisti
</Link>

          <button className={styles.checkoutBtn} onClick={handleCheckout}>
            Procedi al checkout
          </button>
        </div>
      </div>
    </div>
  )
}

