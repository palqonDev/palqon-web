"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/supabaseClient"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
        setUser(data)
      }
    }

    getUser()
  }, [])

  if (!user) return <p>Caricamento profilo...</p>

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-2xl font-bold mb-4">Profilo utente</h1>
      <p><strong>Nome:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Ruolo:</strong> {user.role}</p>
      {user.role === "seller" && (
        <>
          <p><strong>Azienda:</strong> {user.company_name}</p>
          <p><strong>Città:</strong> {user.city}</p>
        </>
      )}
    </div>
  )
}
