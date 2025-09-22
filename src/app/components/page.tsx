"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"
import Link from "next/link"
import styles from "./ComponentsList.module.css"

declare global {
  interface Window {
    google: any
  }
}


type Seller = {
  id: string
  company_name: string
  city: string
  lat: number | null
  lng: number | null
  user_id: string
}

type Component = {
  id: string
  name: string
  description: string
  price_1day: number
  price_original: number | null
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

  // nuovi campi
  brand?: string
  tipologia?: string
  controllo?: string
  colori?: string
  accessori?: string
  rms_power?: string
  coverage?: string
  spl_max?: string
  freq_response?: string
  mixer_incluso?: string
  artist_name?: string
  genre?: string
  durata?: string
  console_inclusa?: string
  attrezzatura?: string
  referenze?: string
  quantita?: string
  materiale?: string

  users: {
    id: string
    company_name: string
    city_name: string
    city_lat: number | null
    city_lng: number | null
  } | null

  distance?: number
  review_count?: number
  avg_rating?: string
  seller_name?: string
  seller_avatar?: string
}


export default function ComponentsResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  

// stati filtri
const [search, setSearch] = useState("")
const [category, setCategory] = useState("all")
const [minPrice, setMinPrice] = useState("")
const [maxPrice, setMaxPrice] = useState("")
const [radiusKm, setRadiusKm] = useState("")
const [sortBy, setSortBy] = useState("default")

const [eventLat, setEventLat] = useState<number | null>(null)
const [eventLng, setEventLng] = useState<number | null>(null)
const [eventPlace, setEventPlace] = useState("")

const autocompleteRef = useRef<HTMLInputElement>(null)

const [components, setComponents] = useState<Component[]>([])
const [loading, setLoading] = useState(true)


  

  const resetFilters = () => {
  setSearch("")
  setCategory("all")
  setMinPrice("")
  setMaxPrice("")
  setSortBy("default")
  setRadiusKm("")
  setEventLat(null)
  setEventLng(null)
  setEventPlace("")
}

  // fetch componenti + reviews summary + user profile
useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // --- componenti ---
let query = supabase
  .from("components")
  .select(`
    id, name, description, price_1day, price_original, images, type, indoor, outdoor,
    power_kw, phase, connector, free_radius_km, extra_cost_per_km,
    peso, assorbimento, lunghezza, larghezza, altezza,
    brand, tipologia, controllo, pax, spl, risposta, genere, durata,
    console, attrezzatura, quantita, materiale, console_modello,
    users ( id, company_name, city_name, city_lat, city_lng )
  `)


       query = query.eq("status", "active" as any)


      if (category && category !== "all") {
        query = query.eq("type", category)
      }
      if (search) {
        query = query.ilike("name", `%${search}%`)
      }
      if (minPrice) {
        query = query.gte("price_1day", parseFloat(minPrice))
      }
      if (maxPrice) {
        query = query.lte("price_1day", parseFloat(maxPrice))
      }

      const { data: comps, error } = await query

      console.log("RAW COMPONENTS FROM DB:", { comps, error })

      if (error) {
        console.error("Errore fetch components:", error)
        setComponents([])
        setLoading(false)
        return
      }

      let results = (comps as unknown as Component[]) || []

      console.log("AFTER ASSIGNING RESULTS:", results)

      // ordinamento
      if (sortBy === "priceAsc") results.sort((a, b) => a.price_1day - b.price_1day)
      if (sortBy === "priceDesc") results.sort((a, b) => b.price_1day - a.price_1day)
      if (sortBy === "nameAsc") results.sort((a, b) => a.name.localeCompare(b.name))
      if (sortBy === "distance" && eventLat && eventLng) {
          results.sort((a, b) => (a.distance || 0) - (b.distance || 0))
}

// calcolo distanza e filtro raggio
if (eventLat != null && eventLng != null) {
  results = results
    .map((c) => {
      const slat = c.users?.city_lat ? Number(c.users.city_lat) : null
const slng = c.users?.city_lng ? Number(c.users.city_lng) : null
      if (slat == null || slng == null) return c
      const dist = getDistanceKm(eventLat, eventLng, slat, slng)
      return { ...c, distance: parseFloat(dist.toFixed(1)) }
    })

  if (radiusKm && !isNaN(Number(radiusKm))) {
    const maxDist = Number(radiusKm)
    results = results.filter(
      (c) => c.distance != null && c.distance <= maxDist
    )
  }

   console.log("AFTER DISTANCE FILTER:", results)
}


      // --- reviews summary ---
      const { data: summaries, error: err2 } = await supabase
        .from("seller_reviews_summary") // view con avg + count
        .select("user_id, review_count, avg_rating")

      if (err2) {
        console.error("Errore fetch summaries:", err2)
      }

      // --- users profile ---
      const { data: usersData, error: err3 } = await supabase
        .from("users")
        .select("id, name, avatar_url")

      if (err3) {
        console.error("Errore fetch users:", err3)
      }

      // merge reviews summary + user profile nei componenti
      if (summaries || usersData) {
        results = results.map((c) => {
          const summary = summaries?.find((s) => s.user_id === c.users?.id)
const user = usersData?.find((u) => u.id === c.users?.id)

          return {
            ...c,
            review_count: summary?.review_count || 0,
            avg_rating: summary
              ? parseFloat(summary.avg_rating as any).toFixed(1)
              : "0.0",
            seller_name: user?.name || "Referente",
            seller_avatar: user?.avatar_url || "/default-avatar.png",
          }
        })
      }

      setComponents(results)
      setLoading(false)
    }

    fetchData()
  }, [
  search,
  category,
  minPrice,
  maxPrice,
  radiusKm,
  eventLat,
  eventLng,
  sortBy,
])

useEffect(() => {
  const params = new URLSearchParams()

  if (search) params.set("search", search)
  if (category && category !== "all") params.set("category", category)
  if (minPrice) params.set("minPrice", minPrice)
  if (maxPrice) params.set("maxPrice", maxPrice)
  if (radiusKm) params.set("radius", radiusKm)
  if (eventLat && eventLng) {
    params.set("event_lat", eventLat.toString())
    params.set("event_lng", eventLng.toString())
  }
  if (eventPlace) params.set("event_city", eventPlace)
  if (sortBy !== "default") params.set("sortBy", sortBy)

  // solo se ci sono parametri, aggiorna URL
  if ([...params.keys()].length > 0) {
    router.push(`/components?${params.toString()}`)
  }
}, [search, category, minPrice, maxPrice, radiusKm, eventLat, eventLng, eventPlace, sortBy])


useEffect(() => {
  if (!autocompleteRef.current) return
  if (!window.google?.maps) return

  const autocomplete = new window.google.maps.places.Autocomplete(
    autocompleteRef.current,
    {
      types: ["(cities)"],
      componentRestrictions: { country: "it" },
    }
  )

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace()
    if (place.geometry) {
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      setEventLat(lat)
      setEventLng(lng)
      setEventPlace(place.formatted_address || place.name || "")
    }
  })
}, [])



// funzione distanza haversine
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Risultati ricerca</h1>

      {/* Toolbar filtri */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <input
            type="text"
            placeholder="Cerca componente..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>


        <div className={styles.toolbarBottom}>

<input
  type="text"
  ref={autocompleteRef}
  placeholder="Luogo evento..."
  className={styles.searchInput}
  value={eventPlace}
  onChange={(e) => setEventPlace(e.target.value)}
/>

<input
  type="number"
  className={styles.priceInput}
  placeholder="Raggio (km)"
  value={radiusKm}
  onChange={(e) => setRadiusKm(e.target.value)}
/>





<input
  type="number"
  className={styles.priceInput}
  placeholder="Prezzo min"
  value={minPrice}
  onChange={(e) => setMinPrice(e.target.value)}
/>
<input
  type="number"
  className={styles.priceInput}
  placeholder="Prezzo max"
  value={maxPrice}
  onChange={(e) => setMaxPrice(e.target.value)}
/>

<select
  className={styles.selectStyled}
  value={category}
  onChange={(e) => setCategory(e.target.value)}


>
  <option value="all">Tutte le categorie</option>
  <option value="AUDIO">Audio</option>
  <option value="LUCI">Luci</option>
  <option value="PALCO">Palchi</option>
  <option value="DJ">DJ</option>
  <option value="BUNDLE">Bundle</option>
</select>

<select
  className={styles.selectStyled}
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
>
  <option value="default">Ordina per</option>
  <option value="priceAsc">Prezzo crescente</option>
  <option value="priceDesc">Prezzo decrescente</option>
  <option value="nameAsc">Nome A–Z</option>
  <option value="distance">Distanza</option>
</select>





<button onClick={resetFilters} className={styles.verifyBtn}>
  Reset
</button>

        </div>
      </div>







      {loading && <p>Caricamento in corso...</p>}
      {!loading && components.length === 0 && (
        <p>Nessun componente trovato.</p>
      )}






     <div className={styles.grid}>
  {components.map((c) => (
    <div key={c.id} className={styles.componentCard}>
      {/* titolo cliccabile */}
      <Link href={`/components/${c.id}`} className={styles.noUnderline}>
        <h2 className={styles.componentTitle}>{c.name}</h2>
      </Link>

      <div className={styles.cardGrid}>
        {/* colonna immagine */}
        <div className={styles.imageWrapper}>
          <Link href={`/components/${c.id}`}>
            {c.images?.length > 0 ? (
              <img
                src={c.images[0]}
                alt={c.name}
                className={styles.componentImg}
              />
            ) : (
              <span className={styles.placeholder}>Nessuna immagine</span>
            )}
          </Link>
        </div>

        {/* colonna info */}
        <div className={styles.infoColumn}>

          {c.distance !== undefined && (
            <p>
              <span className={styles.label}>Distanza:</span>{" "}
              <span className={styles.value}>{c.distance.toFixed(1)} km</span>
            </p>
          )}
          {c.free_radius_km && (
            <p>
              <span className={styles.label}>Trasporto incluso entro:</span>{" "}
              {c.free_radius_km} km
            </p>
          )}
          {c.extra_cost_per_km && (
            <p>
              <span className={styles.label}>Extra costo per km:</span> €{" "}
              {c.extra_cost_per_km}
            </p>
          )}
          {c.peso && (
            <p>
              <span className={styles.label}>Peso:</span> {c.peso} kg
            </p>
          )}
          {c.assorbimento && (
            <p>
              <span className={styles.label}>Assorbimento:</span>{" "}
              {c.assorbimento} W
            </p>
          )}
          {c.power_kw && (
            <p>
              <span className={styles.label}>Potenza:</span> {c.power_kw} kW
            </p>
          )}
          {c.lunghezza && c.larghezza && c.altezza && (
            <p>
              <span className={styles.label}>Dimensioni:</span>{" "}
              {c.lunghezza} × {c.larghezza} × {c.altezza} m
            </p>
          )}
{c.brand && (
  <p><span className={styles.label}>Brand:</span> {c.brand}</p>
)}
{c.tipologia && (
  <p><span className={styles.label}>Tipologia:</span> {c.tipologia}</p>
)}
{c.controllo && (
  <p><span className={styles.label}>Controllo:</span> {c.controllo}</p>
)}
{c.colori && (
  <p><span className={styles.label}>Colori:</span> {c.colori}</p>
)}
{c.accessori && (
  <p><span className={styles.label}>Accessori:</span> {c.accessori}</p>
)}

{c.rms_power && (
  <p><span className={styles.label}>Potenza RMS:</span> {c.rms_power} W</p>
)}
{c.coverage && (
  <p><span className={styles.label}>Copertura:</span> {c.coverage} pax</p>
)}
{c.spl_max && (
  <p><span className={styles.label}>SPL Max:</span> {c.spl_max} dB</p>
)}
{c.freq_response && (
  <p><span className={styles.label}>Risposta freq.:</span> {c.freq_response}</p>
)}
{c.mixer_incluso && (
  <p><span className={styles.label}>Mixer incluso:</span> {c.mixer_incluso}</p>
)}

{c.artist_name && (
  <p><span className={styles.label}>Artista:</span> {c.artist_name}</p>
)}
{c.genre && (
  <p><span className={styles.label}>Genere:</span> {c.genre}</p>
)}
{c.durata && (
  <p><span className={styles.label}>Durata:</span> {c.durata} h</p>
)}
{c.console_inclusa && (
  <p><span className={styles.label}>Console inclusa:</span> {c.console_inclusa}</p>
)}
{c.attrezzatura && (
  <p><span className={styles.label}>Attrezzatura:</span> {c.attrezzatura}</p>
)}
{c.referenze && (
  <p><span className={styles.label}>Referenze:</span> {c.referenze}</p>
)}

{c.quantita && (
  <p><span className={styles.label}>Quantità:</span> {c.quantita}</p>
)}
{c.materiale && (
  <p><span className={styles.label}>Materiale:</span> {c.materiale}</p>
)}


        </div>

        {/* colonna descrizione */}
        <div className={styles.descriptionColumn}>
          <p>
            <span className={styles.label}>Descrizione:</span>{" "}
            {c.description}
          </p>
        </div>

        {/* colonna prezzo/tag */}
        <div className={styles.priceTagColumn}>
          <div className={styles.categoryTagWrapper}>
            <span
              className={`${styles.categoryTag} ${styles[`tag-${c.type}`]}`}
            >
              {c.type}
            </span>
          </div>
          <div className={styles.badgesUnder}>
            {c.indoor && <span className={styles.badge}>Indoor</span>}
            {c.outdoor && <span className={styles.badge}>Outdoor</span>}
          </div>

          <div className={styles.priceBox}>
            {/* bottone e prezzi in riga */}
            <div className={styles.priceRow}>
              <Link
                href={`/components/${c.id}`}
                className={styles.verifyBtnInline}
              >
                Verifica disponibilità
              </Link>
              {c.price_original && (
                <span className={styles.originalPrice}>
                  € {c.price_original}
                </span>
              )}
              <span className={styles.discountedPrice}>€ {c.price_1day}</span>
            </div>

            <div className={styles.priceNote}>IVA inclusa</div>

            {/* seller referente + rating inline */}
<Link href={`/seller/${c.users?.id}`} className={styles.sellerProfile}>
              <img
                src={c.seller_avatar}
                alt={c.seller_name}
                className={styles.sellerAvatar}
              />
              <span className={styles.sellerName}>{c.seller_name}</span>
              <span className={styles.reviewsInline}>
                ★ {c.avg_rating || "0.0"} ({c.review_count || 0})
              </span>
            </Link>

          <p>
            <span className={styles.value}>{c.users?.city_name}</span>
          </p>

          </div>
        </div>
      </div>
    </div>
  ))}
      </div>
    </div>
  )
}
