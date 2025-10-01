"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"

import Hero from "@/components/Hero"
import SearchForm from "@/components/SearchForm"
import ReviewList from "@/components/Review"
import Categories from "@/components/Categories"
import WhyPalqOn from "@/components/WhyPalqOn"
import Footer from "@/components/Footer"

type Seller = { id: string; company_name: string; city: string }
type Component = { id: string; name: string; price_1day: number; photo_url: string; sellers: Seller }
type Review = { id: string; rating: number; comment: string; users: { name: string } }

export default function HomePage() {
  const router = useRouter()

  // login temporaneo
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [logged, setLogged] = useState(false)
  const [msg, setMsg] = useState("")

  const credentials = [
    { user: "admin", pass: "test1234" },
    { user: "seller", pass: "password" }
  ]

  const handleLogin = () => {
    const ok = credentials.some(c => c.user === username && c.pass === password)
    if (!ok) {
      setMsg("Credenziali errate")
      return
    }
    setLogged(true)
  }

  // dati homepage (solo se loggato)
  const [city, setCity] = useState("")
  const [category, setCategory] = useState<string[]>([])
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [timeStart, setTimeStart] = useState("")
  const [timeEnd, setTimeEnd] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    if (!logged) return
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, rating, comment, users:reviewer_id(name)")
          .limit(3)
        if (error || !data) throw error
        setReviews(data as Review[])
      } catch {
        setReviews([])
      }
    }
    fetchReviews()
  }, [logged])

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setCategory(prev => checked ? [...prev, value] : prev.filter(cat => cat !== value))
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

  // se non loggato mostra SEMPRE login
  if (!logged) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
          <h1 className="text-lg mb-4">Login temporaneo</h1>
          <input
            className="w-full mb-2 p-2 rounded bg-gray-700"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full mb-2 p-2 rounded bg-gray-700"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full p-2 bg-blue-500 rounded font-semibold"
          >
            Accedi
          </button>
          {msg && <p className="text-red-400 mt-2">{msg}</p>}
        </div>
      </main>
    )
  }

  // se loggato mostra homepage
  return (
    <>
      <Hero />
      <Categories />
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
      <WhyPalqOn />
      <ReviewList data={reviews} />
      <Footer />
    </>
  )
}
