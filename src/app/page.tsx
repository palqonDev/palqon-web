"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"
import Link from "next/link"
import { Music, Mic, Theater, Grid } from "lucide-react"

type Seller = { id: string; name: string; city: string }
type Component = { id: string; name: string; description: string; price_1day: number; photo_url: string; sellers: Seller }
type Review = { id: string; rating: number; comment: string; users: { name: string } }

export default function HomePage() {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [category, setCategory] = useState("")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [timeStart, setTimeStart] = useState("")
  const [timeEnd, setTimeEnd] = useState("")
  const [allSelected, setAllSelected] = useState(false)

  const [featuredComponents, setFeaturedComponents] = useState<Component[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("components")
        .select("id, name, description, price_1day, photo_url, sellers(id, name, city)")
        .limit(3)
      if (data) setFeaturedComponents(data)
    }

    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, users(name)")
        .limit(3)
      if (data) setReviews(data)
    }

    fetchFeatured()
    fetchReviews()
  }, [])

  const handleSearch = () => {
    const query = new URLSearchParams({
      city,
      start: dateStart,
      end: dateEnd,
      timeStart,
      timeEnd,
      category: allSelected ? "all" : category,
    }).toString()
    router.push(`/components?${query}`)
  }

  return (
    <main className="text-white">
      {/* Hero */}
      <section className="text-center py-20 space-y-8 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-snug">
          Trova e prenota <span className="text-[#00AFFF]">palco</span><br />
          per il tuo prossimo evento
        </h1>
        <p className="text-gray-400 text-lg">
          Organizza concerti, conferenze e spettacoli in pochi click.
        </p>
        <button
          onClick={() => router.push("/components")}
          className="bg-[#007BFF] hover:bg-[#00AFFF] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg transition"
        >
          Inizia ora
        </button>
      </section>

      {/* Search Box */}
      <section className="bg-[#0F172A] border border-white/10 rounded-2xl p-8 shadow-xl max-w-4xl mx-auto my-20 space-y-6">
        <h2 className="text-xl font-semibold text-center">Cerca servizi per il tuo evento</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="text" placeholder="📍 Dove si svolgerà?" value={city} onChange={(e) => setCity(e.target.value)} />
          <div className="flex gap-2">
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="flex-1" />
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="flex-1" />
          </div>
          <div className="flex gap-2">
            <input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className="flex-1" />
            <input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className="flex-1" />
          </div>
        </div>

        {/* Categoria */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => {
                setAllSelected(e.target.checked)
                if (e.target.checked) setCategory("")
              }}
            />
            <span>Tutto</span>
          </label>

          {!allSelected && (
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full">
              <option value="">Scegli una categoria</option>
              <option value="stage">Palchi</option>
              <option value="audio">Audio</option>
              <option value="lights">Luci</option>
              <option value="dj">DJ / Intrattenitori</option>
              <option value="truss">Truss / Americana</option>
              <option value="kit">Kit completi</option>
            </select>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-gradient-to-r from-[#007BFF] to-[#00AFFF] text-white font-bold py-3 rounded-xl shadow hover:shadow-blue-500/50 transition"
        >
          Cerca
        </button>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-6xl mx-auto px-6 space-y-10">
        <h2 className="text-2xl font-bold text-center">Categorie popolari</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { name: "Palchi", icon: <Music className="w-6 h-6 text-[#00AFFF]" /> },
            { name: "Audio", icon: <Mic className="w-6 h-6 text-[#00D4FF]" /> },
            { name: "Luci", icon: <Theater className="w-6 h-6 text-purple-400" /> },
            { name: "DJ", icon: <Grid className="w-6 h-6 text-pink-400" /> },
            { name: "Truss", icon: <Grid className="w-6 h-6 text-[#00AFFF]" /> },
            { name: "Kit completi", icon: <Grid className="w-6 h-6 text-[#FF006E]" /> },
          ].map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center justify-center gap-2 bg-[#0F172A] border border-white/10 rounded-2xl py-10 cursor-pointer hover:bg-[#1E293B] transition"
              onClick={() => router.push(`/components?category=${cat.name.toLowerCase()}`)}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 max-w-6xl mx-auto px-6 space-y-10">
        <h2 className="text-2xl font-bold text-center">In evidenza</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {featuredComponents.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl overflow-hidden bg-[#0F172A] border border-white/10 shadow-lg hover:scale-[1.02] transition"
            >
              <img src={c.photo_url || "/placeholder.png"} alt={c.name} className="w-full h-52 object-cover" />
              <div className="p-6 space-y-2">
                <h3 className="font-bold text-lg">{c.name}</h3>
                <p className="text-gray-400">{c.description}</p>
                <p className="text-[#00AFFF] font-semibold">da {c.price_1day} €</p>
                <p className="text-sm text-gray-500">{c.sellers?.name} – {c.sellers?.city}</p>
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
      <section className="py-20 bg-[#0F172A] border border-white/10 rounded-2xl max-w-6xl mx-auto px-6 space-y-10">
        <h2 className="text-2xl font-bold text-center">Cosa dicono i clienti</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#1E293B] rounded-2xl p-6 shadow space-y-2">
              <p className="text-yellow-400">{"⭐".repeat(r.rating)}</p>
              <p className="italic text-gray-300">"{r.comment}"</p>
              <p className="text-sm text-gray-500">– {r.users?.name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
