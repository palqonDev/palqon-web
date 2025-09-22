"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"

import Hero from "@/components/Hero"
import SearchForm from "@/components/SearchForm"
import Highlights from "@/components/Highlights"
import ReviewList from "@/components/Review"

type Seller = { id: string; company_name: string; city: string }
type Component = { id: string; name: string; price_1day: number; photo_url: string; sellers: Seller }
type Review = { id: string; rating: number; comment: string; users: { name: string } }

export default function HomePage() {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [category, setCategory] = useState<string[]>([])
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

        if (error || !data) throw error
        setFeaturedComponents(data as Component[])
      } catch (error) {
        console.error("Errore fetch components:", error)
        // Fallback placeholder
        setFeaturedComponents([
          { id: "1", name: "Starlight Arena", price_1day: 1200, photo_url: "/placeholder.png", sellers: { id: "1", company_name: "EventPro", city: "Milano" } },
          { id: "2", name: "Grand Hall", price_1day: 900, photo_url: "/placeholder.png", sellers: { id: "2", company_name: "StageMasters", city: "Roma" } },
          { id: "3", name: "Teatro Aurora", price_1day: 750, photo_url: "/placeholder.png", sellers: { id: "3", company_name: "LightTech", city: "Torino" } },
        ])
      }
    }

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, rating, comment, users:reviewer_id(name)")
          .limit(3)

        if (error || !data) throw error
        setReviews(data as Review[])
      } catch (error) {
        console.error("Errore fetch reviews:", error)
        setReviews([])
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
    <>
      <Hero />
      <SearchForm
        city={city}
        setCity={setCity}
        dateStart={dateStart}
        setDateStart={setDateStart}
        dateEnd={dateEnd}
        setDateEnd={setDateEnd}
        timeStart={timeStart}
        setTimeStart={setTimeStart}
        timeEnd={timeEnd}
        setTimeEnd={setTimeEnd}
        category={category}
        handleCategoryChange={handleCategoryChange}
        handleSearch={handleSearch}
      />
      <Highlights data={featuredComponents} />
      <ReviewList data={reviews} />
    </>
  )
}
