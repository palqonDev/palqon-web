"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/supabaseClient"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import styles from "./ComponentDetail.module.css"
import Link from "next/link"


type Component = {
  id: string
  name: string
  description: string
  price_1day: number
  price_original?: number
  images: string[]
  type: string
  indoor: boolean
  outdoor: boolean
  power_kw?: number
  phase?: string
  connector?: string
  free_radius_km?: number
  extra_cost_per_km?: number
  peso?: number
  assorbimento?: number
  lunghezza?: number
  larghezza?: number
  altezza?: number
  brand?: string
  tipologia?: string
  controllo?: string
  quantita?: number
  materiale?: string
  console_modello?: string
  attrezzatura?: string
  city_name?: string

  sellers?: {
    id: string
    user_id: string
    users?: {
      id: string
      name: string
      avatar_url: string
      company_name: string
      city_name: string
    } | null
  } | null
}


type Booking = {
  id: string
  date_start: string
  date_end: string
  status: string
}

type Availability = {
  id: string
  start_time: string
  end_time: string
  available: boolean
}

export default function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [component, setComponent] = useState<Component | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const today = new Date()
  const [selectedRange, setSelectedRange] = useState<[Date, Date]>([today, today])
  const [loading, setLoading] = useState(true)
  const [avgRating, setAvgRating] = useState<string>("0.0")
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [user, setUser] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])


  // fetch component + user + reviews + bookings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

const { data: comp } = await supabase
  .from("components")
  .select(`
    id, name, description, price_1day, price_original, images, type, indoor, outdoor,
    power_kw, phase, connector, free_radius_km, extra_cost_per_km,
    peso, assorbimento, lunghezza, larghezza, altezza,
    brand, tipologia, controllo, quantita, materiale, console_modello, attrezzatura,
    city_name,
    sellers!left (
      id,
      user_id,
      users!left (
        id,
        name,
        avatar_url,
        company_name,
        city_name
      )
    )
  `)
  .eq("id", id)
  .single()


      if (comp) {
        setComponent(comp as unknown as Component)
      }

      // reviews summary
      if (comp?.users?.id) {
        const { data: summary } = await supabase
          .from("seller_reviews_summary")
          .select("user_id, review_count, avg_rating")
          .eq("user_id", comp.users.id)
          .single()

        if (summary) {
          setAvgRating(
            summary.avg_rating
              ? parseFloat(summary.avg_rating as any).toFixed(1)
              : "0.0"
          )
          setReviewCount(summary.review_count || 0)
        }
      }

// ✅ Recupera tutte le prenotazioni che includono questo componente e sono confermate o pagate
const { data: bookingComponents, error: joinError } = await supabase
  .from("booking_components")
  .select(`
    booking_id,
    bookings (
      id,
      date_start,
      date_end,
      status,
      last_payment_status
    )
  `)
  .eq("component_id", id)

if (joinError) {
  console.error("Errore join booking_components → bookings:", joinError)
}

// Filtra solo le prenotazioni confermate o già pagate
const filteredBookings =
  bookingComponents
    ?.map((b) => b.bookings)
    ?.filter(
      (bk) =>
        bk &&
        (bk.status === "confirmed" || bk.last_payment_status === "paid")
    ) || []

setBookings(filteredBookings)



      // availability
      const { data: availData } = await supabase
        .from("availability")
        .select("id, start_time, end_time, available")
        .eq("component_id", id)
      setAvailability(availData || [])

          // cart_items attivi (non scaduti)
    const { data: cartData } = await supabase
      .from("cart_items")
      .select("id, date_start, date_end, expires_at")
      .eq("component_id", id)
      .gt("expires_at", new Date().toISOString()) // solo carrelli ancora validi

    setCartItems(cartData || [])

      // utente loggato
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      setLoading(false)
    }

    fetchData()
  }, [id])

  // calcolo prezzo totale range selezionato
  const calculateTotal = () => {
    if (!component) return "0.00"
    if (!selectedRange) return "0.00"

    let [start, end] = selectedRange

    start = new Date(start.setHours(0, 0, 0, 0))
    end = new Date(end.setHours(0, 0, 0, 0))

    let days =
      Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1

    if (days < 1) days = 1

    const total = days * (component.price_1day || 0)
    return total.toFixed(2)
  }

  // disabilita date occupate o non disponibili
const tileDisabled = ({ date }: { date: Date }) => {
  // bookings confermati/pending
  const booked = bookings.some(
    (b) => date >= new Date(b.date_start) && date <= new Date(b.date_end)
  )
  if (booked) return true

  // availability esplicita
  const notAvailable = availability.some(
    (a) =>
      !a.available &&
      date >= new Date(a.start_time) &&
      date <= new Date(a.end_time)
  )
  if (notAvailable) return true

  // componenti in carrello (bloccati da altri utenti)
  const inCart = cartItems.some(
    (c) => date >= new Date(c.date_start) && date <= new Date(c.date_end)
  )
  if (inCart) return true

  return false
}


  // aggiungi al carrello
  const handleAddToCart = async () => {
    if (!user) {
      alert("Devi effettuare il login per aggiungere al carrello.")
      return
    }
    if (!selectedRange) {
      alert("Seleziona le date.")
      return
    }

    const { data, error } = await supabase.rpc("add_to_cart", {
      p_user_id: user.id,
      p_component_id: component?.id,
      p_date_start: selectedRange[0].toISOString(),
      p_date_end: selectedRange[1].toISOString(),
    })

    if (error) {
      alert(error.message)
    } else {
      const event = new CustomEvent("cart:add")
      window.dispatchEvent(event)
    }
  }

  if (loading) return <p className={styles.container}>Caricamento...</p>
  if (!component) return <p className={styles.container}>Componente non trovato.</p>

  return (
    <div className={styles.container}>
      {/* COLONNA SINISTRA */}
      <div>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{component.name}</h1>
            <span
              className={`${styles.badge} ${styles[`tag-${component.type}`]}`}
            >
              {component.type}
            </span>

            {/* Tag indoor/outdoor */}
            <div className={styles.tagWrapper}>
              {component.indoor && (
                <span className={styles.indoorTag}>Indoor</span>
              )}
              {component.outdoor && (
                <span className={styles.outdoorTag}>Outdoor</span>
              )}
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className={styles.gallery}>
          {component.images && component.images.length > 0 ? (
            <>
              <img
                src={component.images[0]}
                alt={component.name}
                className={styles.mainImage}
              />
              <div className={styles.sideImages}>
                {component.images.slice(1, 4).map((img, i) => (
                  <img key={i} src={img} alt={`preview-${i}`} />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>Nessuna immagine</div>
          )}
        </div>

        {/* Dettagli tecnici */}
        <div className={styles.details}>
          <h2>Dettagli tecnici</h2>
          {component.description && (
            <p className={styles.detailDescription}>{component.description}</p>
          )}
          {component.brand && (
            <p>
              <strong>Brand:</strong> {component.brand}
            </p>
          )}
          {component.power_kw && (
            <p>
              <strong>Potenza:</strong> {component.power_kw} kW
            </p>
          )}
          {component.phase && (
            <p>
              <strong>Fase:</strong> {component.phase}
            </p>
          )}
          {component.connector && (
            <p>
              <strong>Connettore:</strong> {component.connector}
            </p>
          )}
          {component.lunghezza &&
            component.larghezza &&
            component.altezza && (
              <p>
                <strong>Dimensioni:</strong>{" "}
                {component.lunghezza}×{component.larghezza}×{component.altezza} m
              </p>
            )}
          {component.peso && (
            <p>
              <strong>Peso:</strong> {component.peso} kg
            </p>
          )}
          {component.tipologia && (
            <p>
              <strong>Tipologia:</strong> {component.tipologia}
            </p>
          )}
          {component.assorbimento && (
            <p>
              <strong>Assorbimento:</strong> {component.assorbimento} W
            </p>
          )}
          {component.controllo && (
            <p>
              <strong>Controllo:</strong> {component.controllo}
            </p>
          )}
          {component.quantita && (
            <p>
              <strong>Quantità:</strong> {component.quantita}
            </p>
          )}
          {component.materiale && (
            <p>
              <strong>Materiale:</strong> {component.materiale}
            </p>
          )}
          {component.console_modello && (
            <p>
              <strong>Console:</strong> {component.console_modello}
            </p>
          )}
          {component.attrezzatura && (
            <p>
              <strong>Attrezzatura:</strong> {component.attrezzatura}
            </p>
          )}
        </div>
      </div>

      {/* COLONNA DESTRA (SIDEBAR) */}
      <div className={styles.sidebar}>
        {/* Prezzo */}
        <div className={styles.sidebarBox}>
          <h3>Prezzo</h3>
          <div className={styles.priceRow}>
            {component.price_original && (
              <span className={styles.priceOriginal}>
                € {Number(component.price_original).toFixed(2)}
              </span>
            )}
            <span className={styles.priceDay}>
              € {Number(component.price_1day).toFixed(2)}/giorno
            </span>
          </div>
        </div>

        {/* Calendario */}
        <div className={styles.sidebarBox}>
          <h3>Disponibilità</h3>
          <div className={styles.calendarWrapper}>
            <Calendar
              selectRange
              onChange={(range: any) => setSelectedRange(range)}
              tileDisabled={tileDisabled}
            />
          </div>
        </div>

        {/* Riepilogo prenotazione */}
        <div className={styles.sidebarBox}>
          <h3>Riepilogo</h3>
          {selectedRange ? (
            <>
              <p>
                Dal: {selectedRange[0].toLocaleDateString()} – Al:{" "}
                {selectedRange[1].toLocaleDateString()}
              </p>
              <p>Totale: € {calculateTotal()}</p>
            </>
          ) : (
            <p>Seleziona le date dal calendario per vedere il totale</p>
          )}
          <button className={styles.bookBtn} onClick={handleAddToCart}>
            Aggiungi al carrello
          </button>
        </div>

        {/* Info seller */}
        <div className={styles.sidebarBox}>
          <h3>Info seller</h3>
          <div className={styles.sellerInfo}>
            <img
              src={component.users?.avatar_url || "/default-avatar.png"}
              alt="seller"
              className={styles.sellerAvatar}
            />
            <div>
              <Link
                href={`/profile/${component.users?.id}`}
                className={styles.sellerLink}
              >
                <p className={styles.sellerName}>{component.users?.name}</p>
              </Link>
              <Link
                href={`/profile/${component.users?.id}#reviews`}
                className={styles.sellerLink}
              >
                <p className={styles.sellerRating}>
                  ★ {avgRating} ({reviewCount})
                </p>
              </Link>
              <p className={styles.sellerCity}>
                {component.city_name || component.users?.city_name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
