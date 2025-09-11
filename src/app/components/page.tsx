"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/supabaseClient"
import Link from "next/link"

type Component = {
  id: string
  name: string
  description: string
  price_1day: number
  photo_url: string
  sellers: {
    id: string
    name: string
    city: string
  }
}

export default function ComponentsPage() {
  const searchParams = useSearchParams()
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)

  // Parametri dalla ricerca (passati via URL dalla Home)
  const city = searchParams.get("city") || ""
  const category = searchParams.get("category") || ""
  const dateStart = searchParams.get("start") || ""
  const dateEnd = searchParams.get("end") || ""
  const timeStart = searchParams.get("timeStart") || ""
  const timeEnd = searchParams.get("timeEnd") || ""

  useEffect(() => {
    const fetchComponents = async () => {
      setLoading(true)

      let query = supabase
        .from("components")
        .select("id, name, description, price_1day, photo_url, sellers(id,name,city)")

      // Filtri
      if (category && category !== "all") {
        query = query.eq("type", category)
      }

      if (city) {
        query = query.eq("sellers.city", city)
      }

      // NB: Date/orario al momento li teniamo solo come info, 
      // più avanti li usiamo per disponibilità.
      const { data, error } = await query

      if (error) console.error("Errore fetch:", error)
      else setComponents(data || [])

      setLoading(false)
    }

    fetchComponents()
  }, [city, category, dateStart, dateEnd, timeStart, timeEnd])

  if (loading) return <p>Caricamento in corso...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Risultati ricerca</h1>

      {components.length === 0 && <p>Nessun componente trovato per i filtri selezionati.</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {components.map((c) => (
          <div key={c.id} className="border rounded-lg shadow-md overflow-hidden bg-white">
            <img
              src={c.photo_url || "/placeholder.png"}
              alt={c.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-2">
              <h2 className="font-bold text-lg">{c.name}</h2>
              <p className="text-sm text-gray-600">{c.description}</p>
              <p className="text-purple-700 font-semibold">da {c.price_1day} €</p>
              <p className="text-sm text-gray-500">
                Seller: {c.sellers?.name} – {c.sellers?.city}
              </p>
              <div className="flex gap-4 mt-2">
                <Link href={`/components/${c.id}`} className="text-blue-600 underline">
                  Dettagli
                </Link>
                <Link href={`/seller/${c.sellers?.id}`} className="text-blue-600 underline">
                  Profilo Seller
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
