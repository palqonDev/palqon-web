"use client"

import { useState } from "react"
import { supabase } from "@/supabaseClient"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("client") // default client
  const [company, setCompany] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    // 1. Creiamo l'utente su Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id

    // 2. Inseriamo i dati extra nella tabella users
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId,
        name,
        email,
        role,
        company_name: role === "seller" ? company : null,
        city: role === "seller" ? city : null,
      },
    ])

    if (insertError) {
      setErrorMsg(insertError.message)
    } else {
      router.push(role === "seller" ? "/seller/dashboard" : "/client/bookings")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-xl font-bold mb-4">Registrati</h1>
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border w-full rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border w-full rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border w-full rounded"
          required
        />

        {/* Ruolo */}
        <div>
          <label className="mr-4">
            <input
              type="radio"
              value="client"
              checked={role === "client"}
              onChange={(e) => setRole(e.target.value)}
            />{" "}
            Cliente
          </label>
          <label>
            <input
              type="radio"
              value="seller"
              checked={role === "seller"}
              onChange={(e) => setRole(e.target.value)}
            />{" "}
            Seller
          </label>
        </div>

        {/* Campi extra per Seller */}
        {role === "seller" && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nome azienda"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="p-2 border w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Città"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="p-2 border w-full rounded"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded w-full font-semibold"
        >
          {loading ? "Registrazione in corso..." : "Registrati"}
        </button>
      </form>
    </div>
  )
}
