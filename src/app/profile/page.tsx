"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/supabaseClient"
import styles from "./Profile.module.css"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"


export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Identità di base
    name: "",
    phone: "",
    address: "",

// Dati aziendali
company_name: "",
vat_number: "",
city_name: "",
city_lat: null as number | null,
city_lng: null as number | null,
state: "",


    // Dati fiscali
    iban: "",
    account_holder: "",

    // Attività e settore
category_location: false,
category_audio: false,
category_luci: false,
category_palchi: false,
category_artisti: false,
category_bundle: false,
category_altro: false,


    // Altro
    business_description: "",
    role: "",
  })
  const [uploading, setUploading] = useState(false)

  // Stats seller
  const [stats, setStats] = useState({
    bookings: 0,
    revenue: 0,
    rating: 0,
    components: 0,
  })

  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [recentActions, setRecentActions] = useState<any[]>([])
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])

  // Modal aggiunta componente
  const [showModal, setShowModal] = useState(false)
const [newComponent, setNewComponent] = useState({
  // Comuni
  name: "",
  type: "", // categoria selezionata
  description: "",
  brand: "",
  price_original: "",
  price_1day: "",
  free_radius_km: "",
  extra_cost_per_km: "",

  // Palco
  lunghezza: "",
  larghezza: "",
  altezza: "",
  peso: "",

  // Luci
  tipologia: "",
  phase: "",
  assorbimento: "",
  controllo: "",
  colori: "",
  accessori: "",

  // Audio
  rms_power: "",
  coverage: "",
  spl_max: "",
  freq_response: "",
  mixer_incluso: "",

  //Artisti
  artist_name: "",
  genre: "",
  durata: "",
  console_inclusa: "",
  attrezzatura: "",
  referenze: "",

  // Altro
  quantita: "",
  materiale: "",
})

  const [images, setImages] = useState<File[]>([])
  const [currency] = useState("€")

  // --- CLIENT side data ---
  const [clientStats, setClientStats] = useState({ active: 0, spent: 0, reviews: 0 })
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [myGivenReviews, setMyGivenReviews] = useState<any[]>([])

  const [totalSpent, setTotalSpent] = useState(0)
  const [totalReceived, setTotalReceived] = useState(0)



  const {
  ready,
  value: cityValue,
  suggestions: { status, data: suggestions },
  setValue,
  clearSuggestions,
} = usePlacesAutocomplete()

const handleSelectCity = async (val: string) => {
  setValue(val, false)
  clearSuggestions()

  try {
    const results = await getGeocode({ address: val })
    const { lat, lng } = await getLatLng(results[0])

setFormData((prev) => ({
  ...prev,
  city_name: val,
  city_lat: lat,
  city_lng: lng,
}))

  } catch (error) {
    console.error("Errore Google Places:", error)
  }
}


useEffect(() => {
  const getUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      // recupero profilo
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (data) {
        setUser(data)
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          company_name: data.company_name || "",
          vat_number: data.vat_number || "",
          city_name: data.city_name || "",
          city_lat: data.city_lat || null,
          city_lng: data.city_lng || null,
          state: data.state || "",
          iban: data.iban || "",
          account_holder: data.account_holder || "",
          category_audio: data.category_audio || false,
          category_luci: data.category_luci || false,
          category_palchi: data.category_palchi || false,
          category_artisti: data.category_artisti || false,
          category_attrezzatura: data.category_attrezzatura || false,
          business_description: data.business_description || "",
          role: data.role || "client",
        })

        setValue(data.city_name || "", false)

        await fetchClientData(data.id)

        // 🔹 nuovo: calcolo spese/ricavi solo su booking confermati e pagati
// totale speso (come cliente)
const { data: spent } = await supabase
  .from("bookings")
  .select("total_price")
  .eq("client_id", data.id)
  .eq("status", "confirmed")
  .eq("last_payment_status", "paid")

setTotalSpent(spent?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0)

// totale ricevuto (come seller)
const { data: received } = await supabase
  .from("bookings")
  .select("total_price")
  .eq("seller_id", data.id)
  .eq("status", "confirmed")
  .eq("last_payment_status", "paid")

setTotalReceived(received?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0)


        if (data.role === "seller") {
          await fetchStats(data.id)
        }
      }
    }

    setLoading(false)
  }

  getUser()
}, [])


  const fetchStats = async (sellerId: string) => {
    const { count: bookingsCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("status", "active")

    const startOfYear = new Date()
    startOfYear.setMonth(0, 1)
    const { data: revenueData } = await supabase
      .from("bookings")
      .select("total_price, created_at")
      .eq("seller_id", sellerId)
      .gte("created_at", startOfYear.toISOString())

    const monthlyRevenue: { [key: string]: number } = {}
    revenueData?.forEach((b) => {
      const date = new Date(b.created_at)
      const month = date.toLocaleString("it-IT", { month: "short" })
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.total_price || 0)
    })

    setRevenueTrend(
      Object.entries(monthlyRevenue).map(([month, value]) => ({
        month,
        entrate: value,
      }))
    )

    const totalRevenue =
      revenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("rating, created_at, comment")
      .eq("reviewee_id", sellerId)

    const avgRating =
      reviewsData?.length > 0
        ? reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length
        : 0

    const { count: compCount } = await supabase
      .from("components")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", sellerId)

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("id, description, created_at")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(5)

    setRecentBookings(bookingsData || [])

    const actions: any[] = []
    bookingsData?.forEach((b) =>
      actions.push({
        type: "booking",
        text: b.description || "Nuova prenotazione",
        date: b.created_at,
      })
    )
    reviewsData?.slice(0, 3).forEach((r) =>
      actions.push({
        type: "review",
        text: r.comment || "Nuova recensione",
        date: r.created_at,
      })
    )
    setRecentActions(
      actions.sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5)
    )

    setStats({
      bookings: bookingsCount || 0,
      revenue: totalRevenue,
      rating: avgRating,
      components: compCount || 0,
    })

    setReviews(reviewsData?.slice(0, 3) || [])
  }

  const fetchClientData = async (clientId: string) => {
  // prenotazioni come CLIENT
const { data: orders, error } = await supabase
  .from("bookings")
  .select(`
    id,
    client_id,
    date_start,
    date_end,
    total_price,
    status,
    last_payment_status,
booking_components (
  booking_id,
  components (
    id,
    name,
    images
  )
)

  `)
  .eq("client_id", clientId)
  .or(`(status.eq.confirmed.and(client_id.eq.${clientId}),last_payment_status.eq.paid.and(client_id.eq.${clientId}))`)
  .order("created_at", { ascending: false })

if (error) console.error("Errore fetchClientData:", error)
setMyOrders(orders || [])





  // spesa totale e attive
  const totalSpent =
    orders?.reduce((s, o) => s + (Number(o.total_price) || 0), 0) || 0
  const activeCount = orders?.filter(o => o.status === "active" || o.status === "paid")?.length || 0

  // recensioni lasciate come CLIENT
  const { data: given } = await supabase
    .from("reviews")
    .select("rating, comment, created_at")
    .eq("reviewer_id", clientId)
    .order("created_at", { ascending: false })
    .limit(5)

  setMyGivenReviews(given || [])
  setClientStats({ active: activeCount, spent: totalSpent, reviews: given?.length || 0 })
}


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error, data } = await supabase
      .from("users")
      .update(formData)
      .eq("id", user.id)
      .select("*")
      .single()

if (!error && data) {
  setUser(data)
  setFormData((prev) => ({ ...prev, ...data }))
  alert("Dati aggiornati! ✅")
  window.location.reload() // forza refresh così ricompare "Gestisci"
} else {
  console.error(error)
}

  }

  const handleUpload = async (event: any) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Seleziona un file")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const { error: updateError, data } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl.publicUrl })
        .eq("id", user.id)
        .select("*")
        .single()

      if (updateError) throw updateError
      if (data) setUser(data)
    } catch (error) {
      console.error("Errore upload avatar:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
  }

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("components")
        .insert([
          {
            seller_id: user.id,
            name: newComponent.name,
            type: newComponent.type,
            power_kw: newComponent.power_kw,
            connector: newComponent.connector,
            special_requirements: newComponent.special_requirements,
            price_1day: parseFloat(newComponent.price_1day) || 0,
            status: "active",
            city_name: formData.city_name,
            city_lat: formData.city_lat,
            city_lng: formData.city_lng,
          },
        ])
        .select("id")
        .single()

      if (error) throw error

      if (data?.id && images.length > 0) {
        const urls: string[] = []
        for (const file of images) {
          const fileExt = file.name.split(".").pop()
          const fileName = `${data.id}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`
          const filePath = `components/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("components-images")
            .upload(filePath, file)

          if (!uploadError) {
            const { data: publicUrl } = supabase.storage
              .from("components-images")
              .getPublicUrl(filePath)
            urls.push(publicUrl.publicUrl)
          }
        }
        await supabase.from("components").update({ images: urls }).eq("id", data.id)
      }

      setNewComponent({
        name: "",
        type: "",
        power_kw: "",
        connector: "",
        special_requirements: "",
        price_1day: "",
      })
      setImages([])
      setShowModal(false)
      await fetchStats(user.id)
    } catch (err: any) {
      console.error("Errore inserimento componente:", err?.message || err)
    }
  }

const isSellerDataComplete = () => {
  return (
    formData.company_name &&
    formData.vat_number &&
    formData.iban &&
    formData.account_holder &&
    formData.city_name &&
    (formData.category_audio ||
      formData.category_luci ||
      formData.category_palchi ||
      formData.category_dj ||
      formData.category_attrezzatura)
  )
}

  if (loading) return <p>Caricamento...</p>
  if (!user) return <p>Non sei loggato</p>

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.profileHeader}>
        <img
          src={user.avatar_url || "/default-avatar.png"}
          alt="avatar"
          className={styles.avatarBig}
        />
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <label className={styles.uploadBtn}>
            {uploading ? "Caricamento..." : "Cambia foto"}
            <input type="file" accept="image/*" onChange={handleUpload} hidden />
          </label>
        </div>
      </div>

      {/* CLIENT VIEW */}
{user.role === "client" && (
  <div className={styles.clientDashboard}>
    <div className={styles.dashboardGrid}>
      {/* COLONNA SINISTRA */}
      <div className={styles.leftCol}>
        {/* Cards riepilogo */}
        <section className={styles.cards}>
          <div className={styles.card}>
            Prenotazioni attive<br />
            <strong>{clientStats.active}</strong>
          </div>
          <div className={styles.card}>
            Spesa totale<br />
            <strong>€ {totalSpent.toFixed(2)}</strong>
          </div>
          <div className={styles.card}>
            Recensioni lasciate<br />
            <strong>{clientStats.reviews}</strong>
          </div>
        </section>

{/* Le mie prenotazioni */}
<section className={styles.block}>
  <h3>Le mie prenotazioni</h3>

  {myOrders?.length ? (
    <ul className={styles.ordersList}>
      {myOrders.map((order) => {
        const component = order.booking_components?.[0]?.components
        if (!component) return null

        return (
          <li key={order.id} className={styles.orderCard}>
            <Link href={`/components/${component.id}`} className={styles.orderLink}>
              <div className={styles.orderMain}>
                <div className={styles.orderHeader}>
                  <span className={styles.componentName}>{component.name}</span>
                  <span
                    className={`${styles.badgeStatus} ${
                      order.last_payment_status === "paid"
                        ? styles.badgePaid
                        : styles.badgePending
                    }`}
                  >
                    {order.last_payment_status === "paid" ? "Pagato" : "In attesa"}
                  </span>
                </div>
                <div className={styles.orderMeta}>
                  {new Date(order.date_start).toLocaleDateString("it-IT")} →
                  {new Date(order.date_end).toLocaleDateString("it-IT")}
                </div>
                <div className={styles.orderAmount}>
                  € {Number(order.total_price).toFixed(2)}
                </div>
              </div>

              {component.images?.[0] && (
                <img
                  src={component.images[0]}
                  alt={component.name}
                  className={styles.orderImage}
                />
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  ) : (
    <p>Nessuna prenotazione trovata.</p>
  )}
</section>



        {/* Le mie recensioni */}
        <section className={styles.block}>
          <h3>Le mie recensioni</h3>
          {myGivenReviews.length > 0 ? (
            <ul className={styles.reviewsList}>
              {myGivenReviews.map((r, i) => (
                <li key={i}>
                  {"⭐".repeat(r.rating)} <span>{r.comment || ""}</span>
                  <div className={styles.reviewMeta}>
                    {new Date(r.created_at).toLocaleDateString("it-IT")}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nessuna recensione inviata</p>
          )}
        </section>

        {/* Supporto */}
        <section className={styles.block}>
          <h3>Supporto & FAQ</h3>
          <a href="/faq">FAQ</a>
          <a href="/support">Contatta assistenza</a>
          <a href="/terms">Termini e rimborsi</a>
        </section>
      </div>

      {/* COLONNA DESTRA */}
      <div className={styles.rightCol}>
        {/* Dati personali */}
        <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
          <h3>Dati personali</h3>
          <label>Nome e Cognome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <label>Email</label>
          <input type="email" value={user.email} disabled />

          <label>Telefono</label>
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <label>Indirizzo</label>
          <input
            type="text"
            value={formData.address || ""}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <label>Città</label>
          <input
            type="text"
            value={formData.city_name || ""}
            onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
          />

          <label>Stato</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />

          <button type="submit">Salva modifiche</button>
        </form>

        {/* Diventa Seller */}
<section className={styles.block}>
  <h3>Vuoi diventare un Seller?</h3>
  <form
    onSubmit={handleUpdateProfile}
    className={styles.sellerForm}
  >
    <input
      type="text"
      placeholder="Nome azienda"
      value={formData.company_name}
      onChange={(e) =>
        setFormData({ ...formData, company_name: e.target.value })
      }
    />
    <input
      type="text"
      placeholder="Partita IVA"
      value={formData.vat_number}
      onChange={(e) =>
        setFormData({ ...formData, vat_number: e.target.value })
      }
    />
    <textarea
      placeholder="Descrizione attività"
      value={formData.business_description}
      onChange={(e) =>
        setFormData({
          ...formData,
          business_description: e.target.value,
        })
      }
    />
    <button
      type="submit"
      onClick={() =>
        setFormData((prev) => ({ ...prev, role: "seller" }))
      }
    >
      Diventa Seller
    </button>
  </form>
</section>


        {/* Notifiche e account */}
        <section className={styles.block}>
          <h3>Account</h3>
          <ul>
            <li><a href="/auth/change-password">Cambia password</a></li>
            <li><a href="/auth/logout">Logout</a></li>
          </ul>
        </section>
      </div>
    </div>
  </div>
)}


      {/* SELLER VIEW */}
{user.role === "seller" && (
  <div className={styles.sellerDashboard}>
    <div className={styles.dashboardGrid}>
      {/* COLONNA SINISTRA */}
      <div className={styles.leftCol}>
        {/* Card riepilogo */}
        <section className={styles.cards}>
          <div className={styles.card}>
            Prenotazioni attive<br />
            <strong>{stats.bookings}</strong>
          </div>
          <div className={styles.card}>
            Entrate totali<br />
            <strong>€ {totalReceived.toFixed(2)}</strong>
          </div>
          <div className={styles.card}>
            Recensioni<br />
            <strong>{stats.rating.toFixed(1)} ★</strong>
          </div>
          <div className={styles.card}>
            Componenti<br />
            <strong>{stats.components}</strong>
          </div>
        </section>

        {/* Andamento entrate */}
        <section className={styles.block}>
          <h3>Andamento entrate</h3>
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="entrate"
                  stroke="#00afff"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Nessun dato disponibile</p>
          )}
        </section>

        {/* Attività recente */}
        <section className={styles.block}>
          <h3>Attività recente</h3>
          {recentActions.length > 0 ? (
            <ul>
              {recentActions.map((a, i) => (
                <li key={i}>
                  <strong>{a.type === "booking" ? "📦" : "⭐"}</strong>{" "}
                  {a.text} • {new Date(a.date).toLocaleDateString("it-IT")}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nessuna attività recente</p>
          )}
        </section>

        {/* I tuoi componenti */}
<section className={styles.block}>
  <h3>I tuoi componenti</h3>
  {isSellerDataComplete() ? (
    <a href="/seller/components">Gestisci</a>
  ) : (
    <p style={{ color: "red" }}>
      Compila tutta l’anagrafica per poter gestire i tuoi componenti
    </p>
  )}
</section>


        {/* Recensioni clienti */}
        <section className={styles.block}>
          <h3>Recensioni clienti</h3>
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <p key={r.id}>
                {"⭐".repeat(r.rating)} {r.comment || ""}
              </p>
            ))
          ) : (
            <p>Non hai ancora una recensione</p>
          )}
          <a href="/seller/reviews">Leggi tutte</a>
        </section>

        {/* Supporto seller */}
        <section className={styles.block}>
          <h3>Supporto Seller</h3>
          <a href="/faq">FAQ</a>
          <a href="/support">Contatta assistenza</a>
        </section>

{/* Ordini come cliente */}
<section className={styles.block}>
  <h3>I miei ordini (da cliente)</h3>
  {myOrders.length > 0 ? (
    <ul className={styles.ordersList}>
      {myOrders.map((o) => (
        <li key={o.id}>
          <span>#{o.id.slice(0, 8)}</span> •
          <span> {new Date(o.created_at).toLocaleDateString("it-IT")} </span> •
          <span className={styles.badgeStatus}>{o.status}</span> •
          <strong> € {Number(o.total_price || 0).toFixed(2)}</strong>
        </li>
      ))}
    </ul>
  ) : (
    <p>Nessun ordine</p>
  )}
</section>

{/* Recensioni inviate */}
<section className={styles.block}>
  <h3>Le mie recensioni inviate</h3>
  {myGivenReviews.length > 0 ? (
    <ul className={styles.reviewsList}>
      {myGivenReviews.map((r, i) => (
        <li key={i}>
          {"⭐".repeat(r.rating)} <span>{r.comment || ""}</span>
          <div className={styles.reviewMeta}>
            {new Date(r.created_at).toLocaleDateString("it-IT")}
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p>Nessuna recensione inviata</p>
  )}
</section>



      </div>

      {/* COLONNA DESTRA */}
<div className={styles.rightCol}>
  <form onSubmit={handleUpdateProfile} className={styles.sellerForm}>
    <h3>Dati Anagrafici Seller</h3>

    {/* IDENTITÀ DI BASE */}
    <fieldset className={styles.fieldGroup}>
      <legend>Identità di base</legend>
      <label>Nome e Cognome referente</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
      />

      <label>Email di contatto</label>
      <input type="email" value={user.email} disabled />

      <label>Telefono</label>
      <input
        type="tel"
        value={formData.phone || ""}
        onChange={(e) =>
          setFormData({ ...formData, phone: e.target.value })
        }
      />

      <label>Indirizzo completo</label>
      <input
        type="text"
        value={formData.address || ""}
        onChange={(e) =>
          setFormData({ ...formData, address: e.target.value })
        }
      />
    </fieldset>

    {/* DATI AZIENDALI */}
    <fieldset className={styles.fieldGroup}>
      <legend>Dati aziendali</legend>
      <label>Nome azienda / Ragione sociale</label>
      <input
        type="text"
        value={formData.company_name}
        onChange={(e) =>
          setFormData({ ...formData, company_name: e.target.value })
        }
      />

      <label>Partita IVA</label>
      <input
        type="text"
        value={formData.vat_number}
        onChange={(e) =>
          setFormData({ ...formData, vat_number: e.target.value })
        }
      />

<label>Sede operativa (città)</label>
<input
  type="text"
  value={cityValue || formData.city_name || ""}
  onChange={(e) => setValue(e.target.value)}
  disabled={!ready}
  placeholder="Cerca città..."
/>


{status === "OK" && (
  <ul className={styles.placesList}>
    {suggestions.map((sug) => (
      <li
        key={sug.place_id}
        onClick={() => handleSelectCity(sug.description)}
        className={styles.placeItem}
      >
        {sug.description}
      </li>
    ))}
  </ul>
)}



      <input
        type="text"
        value={formData.state}
        onChange={(e) =>
          setFormData({ ...formData, state: e.target.value })
        }
        placeholder="Stato"
      />
    </fieldset>

    {/* DATI FISCALI */}
    <fieldset className={styles.fieldGroup}>
      <legend>Dati fiscali</legend>
      <label>IBAN</label>
      <input
        type="text"
        value={formData.iban || ""}
        onChange={(e) =>
          setFormData({ ...formData, iban: e.target.value })
        }
      />

      <label>Intestatario conto</label>
      <input
        type="text"
        value={formData.account_holder || ""}
        onChange={(e) =>
          setFormData({ ...formData, account_holder: e.target.value })
        }
      />

{/* Metodo di pagamento per acquisti da cliente */}
<section className={styles.block}>
  <h3>Metodo di pagamento</h3>
  {user.card_last4 ? (
    <p className={styles.payBox}>
      Carta salvata: {user.card_brand?.toUpperCase() || "CARD"} •••• {user.card_last4}
    </p>
  ) : (
    <p className={styles.payBox}>
      Nessuna carta salvata. <a href="/billing">Aggiungi carta</a>
    </p>
  )}
</section>



    </fieldset>

    {/* ATTIVITÀ E SETTORE */}
    <fieldset className={styles.fieldGroup}>
      <legend>Attività e settore</legend>
      <label>Categoria principale</label>
      <div className={styles.checkGroup}>
        <label>
          <input
            type="checkbox"
            checked={formData.category_audio || false}
            onChange={(e) =>
              setFormData({ ...formData, category_audio: e.target.checked })
            }
          />
          Audio
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.category_luci || false}
            onChange={(e) =>
              setFormData({ ...formData, category_luci: e.target.checked })
            }
          />
          Luci
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.category_palchi || false}
            onChange={(e) =>
              setFormData({ ...formData, category_palchi: e.target.checked })
            }
          />
          Palchi
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.category_dj || false}
            onChange={(e) =>
              setFormData({ ...formData, category_dj: e.target.checked })
            }
          />
          DJ
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.category_attrezzatura || false}
            onChange={(e) =>
              setFormData({ ...formData, category_attrezzatura: e.target.checked })
            }
          />
          Attrezzatura
        </label>
      </div>
    </fieldset>

    <button type="submit">Aggiorna dati seller</button>
  </form>
</div>

    </div>
  </div>
)}


{/* MODAL ADD COMPONENT */}
{showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <button
        className={styles.closeBtn}
        onClick={() => setShowModal(false)}
      >
        ✖
      </button>
      <h3>Nuovo componente</h3>

      {/* Schede categoria */}
      <div className={styles.categoryTabs}>
        {["PALCO", "LUCI", "AUDIO", "DJ", "ALTRO"].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.categoryTab} ${newComponent.type === cat ? styles.activeTab : ""}`}
            onClick={() => setNewComponent({ ...newComponent, type: cat })}
          >
            {cat}
          </button>
        ))}
      </div>

      <form onSubmit={handleAddComponent} className={styles.sellerForm}>
        {/* Campi comuni */}
        {(newComponent.type === "PALCO" ||
          newComponent.type === "LUCI" ||
          newComponent.type === "AUDIO" ||
          newComponent.type === "DJ" ||
          newComponent.type === "ALTRO") && (
          <>
            {newComponent.type !== "DJ" && (
              <>
                <label>Nome componente</label>
                <input
                  type="text"
                  value={newComponent.name}
                  onChange={(e) =>
                    setNewComponent({ ...newComponent, name: e.target.value })
                  }
                />
              </>
            )}
          </>
        )}

        {/* PALCO */}
        {newComponent.type === "PALCO" && (
          <>
            <label>Lunghezza (m)</label>
            <input
              type="text"
              value={newComponent.lunghezza || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, lunghezza: e.target.value })
              }
            />
            <label>Larghezza (m)</label>
            <input
              type="text"
              value={newComponent.larghezza || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, larghezza: e.target.value })
              }
            />
            <label>Altezza (m)</label>
            <input
              type="text"
              value={newComponent.altezza || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, altezza: e.target.value })
              }
            />
            <label>Peso (kg)</label>
            <input
              type="text"
              value={newComponent.peso || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, peso: e.target.value })
              }
            />
            <label>Prezzo originale (€)</label>
            <input
              type="number"
              value={newComponent.price_original || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, price_original: e.target.value })
              }
            />
            <label>Prezzo scontato (€)</label>
            <input
              type="number"
              value={newComponent.price_1day || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, price_1day: e.target.value })
              }
            />
            <label>Marchio</label>
            <input
              type="text"
              value={newComponent.brand || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, brand: e.target.value })
              }
            />
            <label>Trasporto incluso entro (km)</label>
            <input
              type="number"
              value={newComponent.free_radius_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, free_radius_km: e.target.value })
              }
            />
            <label>Costo extra al km (€)</label>
            <input
              type="number"
              value={newComponent.extra_cost_per_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, extra_cost_per_km: e.target.value })
              }
            />
            <label>Descrizione</label>
            <textarea
              value={newComponent.description || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, description: e.target.value })
              }
            />
          </>
        )}

        {/* LUCI */}
        {newComponent.type === "LUCI" && (
          <>
            <label>Tipologia</label>
            <input
              type="text"
              value={newComponent.tipologia || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, tipologia: e.target.value })
              }
            />
            <label>Peso (kg)</label>
            <input
              type="text"
              value={newComponent.peso || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, peso: e.target.value })
              }
            />
            <label>Alimentazione</label>
            <select
              value={newComponent.phase || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, phase: e.target.value })
              }
            >
              <option value="">-- seleziona --</option>
              <option value="monofase">Monofase</option>
              <option value="trifase">Trifase</option>
            </select>
            <label>Assorbimento (W)</label>
            <input
              type="number"
              value={newComponent.assorbimento || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, assorbimento: e.target.value })
              }
            />
            <label>Tipo di controllo</label>
            <input
              type="text"
              value={newComponent.controllo || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, controllo: e.target.value })
              }
            />
            <label>Colori</label>
            <input
              type="text"
              value={newComponent.colori || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, colori: e.target.value })
              }
            />
            <label>Accessori inclusi</label>
            <input
              type="text"
              value={newComponent.accessori || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, accessori: e.target.value })
              }
            />
            <label>Prezzo originale (€)</label>
            <input
              type="number"
              value={newComponent.price_original || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, price_original: e.target.value })
              }
            />
            <label>Prezzo scontato (€)</label>
            <input
              type="number"
              value={newComponent.price_1day || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, price_1day: e.target.value })
              }
            />
            <label>Marchio</label>
            <input
              type="text"
              value={newComponent.brand || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, brand: e.target.value })
              }
            />
            <label>Trasporto incluso entro (km)</label>
            <input
              type="number"
              value={newComponent.free_radius_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, free_radius_km: e.target.value })
              }
            />
            <label>Costo extra al km (€)</label>
            <input
              type="number"
              value={newComponent.extra_cost_per_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, extra_cost_per_km: e.target.value })
              }
            />
            <label>Descrizione</label>
            <textarea
              value={newComponent.description || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, description: e.target.value })
              }
            />
          </>
        )}

        {/* AUDIO */}
        {newComponent.type === "AUDIO" && (
          <>
            <label>Marchio</label>
            <input
              type="text"
              value={newComponent.brand || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, brand: e.target.value })
              }
            />
            <label>Potenza RMS (W)</label>
            <input
              type="text"
              value={newComponent.rms_power || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, rms_power: e.target.value })
              }
            />
            <label>Copertura (PAX)</label>
            <input
              type="text"
              value={newComponent.coverage || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, coverage: e.target.value })
              }
            />
            <label>SPL Max (dB)</label>
            <input
              type="text"
              value={newComponent.spl_max || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, spl_max: e.target.value })
              }
            />
            <label>Tipologia</label>
            <input
              type="text"
              value={newComponent.tipologia || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, tipologia: e.target.value })
              }
            />
            <label>Risposta in frequenza</label>
            <input
              type="text"
              value={newComponent.freq_response || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, freq_response: e.target.value })
              }
            />
            <label>Peso (kg)</label>
            <input
              type="text"
              value={newComponent.peso || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, peso: e.target.value })
              }
            />
            <label>Assorbimento (W)</label>
            <input
              type="number"
              value={newComponent.assorbimento || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, assorbimento: e.target.value })
              }
            />
            <label>Mixer necessario</label>
            <select
              value={newComponent.mixer_incluso || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, mixer_incluso: e.target.value })
              }
            >
              <option value="">-- seleziona --</option>
              <option value="si">Sì</option>
              <option value="no">No</option>
            </select>
            <label>Prezzo originale (€)</label>
            <input
              type="number"
              value={newComponent.price_original || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, price_original: e.target.value })
              }
            />
            <label>Prezzo scontato (€)</label>
            <input
              type="number"
              value={newComponent.price_1day || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, price_1day: e.target.value })
              }
            />
            <label>Trasporto incluso entro (km)</label>
            <input
              type="number"
              value={newComponent.free_radius_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, free_radius_km: e.target.value })
              }
            />
            <label>Costo extra al km (€)</label>
            <input
              type="number"
              value={newComponent.extra_cost_per_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, extra_cost_per_km: e.target.value })
              }
            />
            <label>Descrizione</label>
            <textarea
              value={newComponent.description || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, description: e.target.value })
              }
            />
          </>
        )}

        {/* DJ */}
        {newComponent.type === "DJ" && (
          <>
            <label>Nome artista</label>
            <input
              type="text"
              value={newComponent.artist_name || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, artist_name: e.target.value })
              }
            />
            <label>Genere musicale</label>
            <input
              type="text"
              value={newComponent.genre || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, genre: e.target.value })
              }
            />
            <label>Durata performance (h)</label>
            <input
              type="number"
              value={newComponent.durata || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, durata: e.target.value })
              }
            />
            <label>Console inclusa</label>
            <select
              value={newComponent.console_inclusa || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, console_inclusa: e.target.value })
              }
            >
              <option value="">-- seleziona --</option>
              <option value="si">Sì</option>
              <option value="no">No</option>
            </select>
            <label>Attrezzatura richiesta</label>
            <textarea
              value={newComponent.attrezzatura || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, attrezzatura: e.target.value })
              }
            />
            <label>Esperienza / Referenze</label>
            <textarea
              value={newComponent.referenze || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, referenze: e.target.value })
              }
            />
            <label>Costo entro (km)</label>
            <input
              type="number"
              value={newComponent.free_radius_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, free_radius_km: e.target.value })
              }
            />
            <label>Costo extra al km (€)</label>
            <input
              type="number"
              value={newComponent.extra_cost_per_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, extra_cost_per_km: e.target.value })
              }
            />
            <label>Descrizione</label>
            <textarea
              value={newComponent.description || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, description: e.target.value })
              }
            />
          </>
        )}

        {/* ALTRO */}
        {newComponent.type === "ALTRO" && (
          <>
            <label>Nome componente</label>
            <input
              type="text"
              value={newComponent.name || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, name: e.target.value })
              }
            />
            <label>Tipologia</label>
            <input
              type="text"
              value={newComponent.tipologia || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, tipologia: e.target.value })
              }
            />
            <label>Quantità</label>
            <input
              type="number"
              value={newComponent.quantita || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, quantita: e.target.value })
              }
            />
            <label>Peso (kg)</label>
            <input
              type="text"
              value={newComponent.peso || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, peso: e.target.value })
              }
            />
            <label>Materiale</label>
            <input
              type="text"
              value={newComponent.materiale || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, materiale: e.target.value })
              }
            />
            <label>Prezzo originale (€)</label>
            <input
              type="number"
              value={newComponent.price_original || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, price_original: e.target.value })
              }
            />
            <label>Prezzo scontato (€)</label>
            <input
              type="number"
              value={newComponent.price_1day || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, price_1day: e.target.value })
              }
            />
            <label>Marchio</label>
            <input
              type="text"
              value={newComponent.brand || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, brand: e.target.value })
              }
            />
            <label>Trasporto incluso entro (km)</label>
            <input
              type="number"
              value={newComponent.free_radius_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, free_radius_km: e.target.value })
              }
            />
            <label>Costo extra al km (€)</label>
            <input
              type="number"
              value={newComponent.extra_cost_per_km || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, extra_cost_per_km: e.target.value })
              }
            />
            <label>Descrizione</label>
            <textarea
              value={newComponent.description || ""}
              onChange={(e) =>
                setNewComponent({ ...newComponent, description: e.target.value })
              }
            />
          </>
        )}

        {/* Upload immagini */}
        <label>Immagini</label>
        <input type="file" multiple onChange={handleImageChange} />
        <div className={styles.imagePreview}>
          {images.map((img, i) => (
            <div key={i} className={styles.imageItem}>
              <img src={URL.createObjectURL(img)} alt="preview" />
              <button onClick={() => setImages(images.filter((_, idx) => idx !== i))}>✖</button>
            </div>
          ))}
        </div>

        <button type="submit">Salva componente</button>
      </form>
    </div>
  </div>
)
}
</div>)}