"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"
import Link from "next/link"
import { Music, Mic, Theater, Grid } from "lucide-react"

type Seller = { id: string; company_name: string; city: string }
type Component = { id: string; name: string; price_1day: number; photo_url: string; sellers: Seller }
type Review = { id: string; rating: number; comment: string; users: { name: string } }

export default function HomePage() {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [category, setCategory] = useState<string[]>([]) // Array per gestire più categorie
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [timeStart, setTimeStart] = useState("")
  const [timeEnd, setTimeEnd] = useState("")

  const [featuredComponents, setFeaturedComponents] = useState<Component[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from("components")
          .select("id, name, price_1day, photo_url, sellers(id, company_name, city)")
          .limit(3)
        if (error) {
          console.error("Errore fetch components:", error.message)
          setFeaturedComponents([
            { id: "1", name: "Starlight Arena", price_1day: 1200, photo_url: "/placeholder.png", sellers: { id: "1", company_name: "EventPro", city: "Milano" } },
            { id: "2", name: "Grand Hall", price_1day: 900, photo_url: "/placeholder.png", sellers: { id: "2", company_name: "StageMasters", city: "Roma" } },
            { id: "3", name: "Teatro Aurora", price_1day: 750, photo_url: "/placeholder.png", sellers: { id: "3", company_name: "LightTech", city: "Torino" } },
          ] as Component[])
        } else if (data) {
          setFeaturedComponents(data as Component[])
        }
      } catch (err) {
        console.error("Errore generale fetch components:", err)
        setFeaturedComponents([
          { id: "1", name: "Starlight Arena", price_1day: 1200, photo_url: "/placeholder.png", sellers: { id: "1", company_name: "EventPro", city: "Milano" } },
          { id: "2", name: "Grand Hall", price_1day: 900, photo_url: "/placeholder.png", sellers: { id: "2", company_name: "StageMasters", city: "Roma" } },
          { id: "3", name: "Teatro Aurora", price_1day: 750, photo_url: "/placeholder.png", sellers: { id: "3", company_name: "LightTech", city: "Torino" } },
        ] as Component[])
      }
    }

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, rating, comment, users:reviewer_id(name)")
          .limit(3)
        if (error) {
          console.error("Errore fetch reviews:", error.message)
          setReviews([]) // Fallback vuoto
        } else if (data) {
          setReviews(data as Review[])
        }
      } catch (err) {
        console.error("Errore generale fetch reviews:", err)
        setReviews([]) // Fallback vuoto
      }
    }

    fetchFeatured()
    fetchReviews()
  }, [])

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setCategory((prev) =>
      checked ? [...prev, value] : prev.filter((cat) => cat !== value)
    )
  }

  const handleSearch = () => {
    const query = new URLSearchParams({
      city,
      start: dateStart,
      end: dateEnd,
      timeStart,
      timeEnd,
      category: category.length > 0 ? category.join(",") : "all",
    }).toString()
    router.push(`/components?${query}`)
  }

  return (
    <main className="text-white min-h-screen bg-gradient-to-b from-[#0B0E17] to-[#1E293B]">
      {/* Hero */}
      <section className="text-center py-16 md:py-20 space-y-6 md:space-y-8 max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-snug">
          Trova e prenota palco<br />
          per il tuo prossimo evento
        </h1>
        <button
          onClick={() => router.push("/components")}
          className="bg-gradient-to-r from-[#007BFF] to-[#00AFFF] hover:from-[#00AFFF] hover:to-[#007BFF] text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Inizia ora
        </button>
      </section>

      {/* Search Box - Layout ordinato e professionale */}
     <section className="py-8 md:py-12 mx-auto px-6 md:px-8">
  <div className="bg-[#0F172A] rounded-2xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
    <h2 className="text-lg md:text-xl font-semibold text-center">Cerca servizi per il tuo evento</h2>

{/* Sezione Ricerca con layout corretto */}
<section className="w-full bg-[#0F172A] rounded-3xl py-8">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      
      {/* Campo Luogo */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Luogo</label>
        <input
          type="text"
          placeholder="📍 Dove si svolgerà?"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full py-3 px-4 rounded-full bg-[#1E293B] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00AFFF] focus:outline-none"
        />
      </div>

      {/* Campo Data Inizio */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Data Inizio</label>
        <input
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          className="w-full py-3 px-4 rounded-full bg-[#1E293B] text-white focus:ring-2 focus:ring-[#00AFFF] focus:outline-none"
        />
      </div>

      {/* Campo Data Fine */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Data Fine</label>
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          className="w-full py-3 px-4 rounded-full bg-[#1E293B] text-white focus:ring-2 focus:ring-[#00AFFF] focus:outline-none"
        />
      </div>

      {/* Campo Ora Inizio */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Ora Inizio</label>
        <input
          type="time"
          value={timeStart}
          onChange={(e) => setTimeStart(e.target.value)}
          className="w-full py-3 px-4 rounded-full bg-[#1E293B] text-white focus:ring-2 focus:ring-[#00AFFF] focus:outline-none"
        />
      </div>

      {/* Campo Ora Fine */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Ora Fine</label>
        <input
          type="time"
          value={timeEnd}
          onChange={(e) => setTimeEnd(e.target.value)}
          className="w-full py-3 px-4 rounded-full bg-[#1E293B] text-white focus:ring-2 focus:ring-[#00AFFF] focus:outline-none"
        />
      </div>
      
    </div>
  </div>
</section>





    {/* Terza Parte: Checkbox per Categorie */}
    <div className="space-y-4">
      <h3 className="text-sm md:text-base font-medium text-gray-400">Seleziona le categorie:</h3>
      <div className="grid grid-cols-6 md:grid-cols-3 gap-6 md:gap-8">
        {[
          "Palchi",
          "Audio",
          "Luci",
          "DJ / Intrattenitori",
          "Truss / Americana",
          "Kit completi",
        ].map((cat) => (
          <label key={cat} className="flex items-center gap-3 text-sm md:text-base">
            <input
              type="checkbox"
              value={cat.toLowerCase().replace(/ /g, "_")}
              checked={category.includes(cat.toLowerCase().replace(/ /g, "_"))}
              onChange={handleCategoryChange}
              className="h-5 w-5 rounded border-white/10 focus:ring-2 focus:ring-[#00AFFF]"
            />
            <span className="text-white">{cat}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="flex justify-center mt-6">
      <button
        onClick={handleSearch}
        className="bg-gradient-to-r from-[#007BFF] to-[#00AFFF] hover:from-[#00AFFF] hover:to-[#007BFF] text-white font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        Cerca
      </button>
    </div>
  </div>
</section>

      {/* Featured */}
      <section className="py-12 md:py-16 max-w-5xl mx-auto px-4 md:px-6 space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-left">In evidenza</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {featuredComponents.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl overflow-hidden bg-[#0F172A] shadow-lg hover:scale-[1.02] transition"
            >
              <img src={c.photo_url || "/placeholder.png"} alt={c.name} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-base md:text-lg">{c.name}</h3>
                <p className="text-gray-400 text-sm">{c.description || "Nessuna descrizione"}</p>
                <p className="text-[#00AFFF] font-semibold">da {c.price_1day} €</p>
                <p className="text-sm text-gray-500">{c.sellers?.company_name} – {c.sellers?.city}</p>
                <div className="flex gap-4 pt-2">
                  <Link href={`/components/${c.id}`} className="text-[#FF006E] hover:underline">Dettagli</Link>
                  <Link href={`/seller/${c.sellers?.id}`} className="text-[#00AFFF] hover:underline">Seller</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-12 md:py-16 bg-[#0F172A] rounded-2xl max-w-5xl mx-auto px-4 md:px-6 space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Cosa dicono i clienti</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#1E293B] rounded-2xl p-4 space-y-1">
              <p className="text-yellow-400">{"⭐".repeat(r.rating)}</p>
              <p className="italic text-gray-300 text-sm">"{r.comment}"</p>
              <p className="text-xs text-gray-500">– {r.users?.name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}