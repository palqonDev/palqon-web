"use client"

import { useState } from "react"
import { supabase } from "@/supabaseClient"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg(error.message)
    } else {
      // Recuperiamo ruolo utente
      const userId = data.user?.id
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single()

      if (userData?.role === "seller") {
        router.push("/seller/dashboard")
      } else {
        router.push("/client/bookings")
      }
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
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
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded w-full font-semibold">
          Login
        </button>
      </form>
    </div>
  )
}
