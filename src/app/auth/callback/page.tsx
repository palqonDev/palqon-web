"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleOAuthLogin = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !sessionData.session) {
        console.error("Errore durante il recupero della sessione:", sessionError)
        return
      }

      const user = sessionData.session.user

      // Verifica se l'utente esiste nella tabella users
      const { data: existingUser, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error && error.code === "PGRST116") {
        // Utente nuovo → inserimento
        await supabase.from("users").insert([
          {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email,
            role: "client", // Default a "client", può essere modificato poi
          },
        ])
        router.refresh()
        router.push("/client/bookings")
      } else {
        router.refresh()
        router.push(existingUser?.role === "seller" ? "/seller/dashboard" : "/client/bookings")
      }
    }

    handleOAuthLogin()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-white text-lg">
      Stiamo completando l'autenticazione...
    </div>
  )
}
