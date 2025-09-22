"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"
import styles from "./Login.module.css"
import { FcGoogle } from "react-icons/fc"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg("Credenziali non valide.")
      setLoading(false)
      return
    }

    router.push("/") // 👈 dopo login vado in home
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` }, // 👈 Google -> home
    })
    if (error) setErrorMsg(error.message)
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Accedi</h1>
        {errorMsg && <p className={styles.error}>{errorMsg}</p>}

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />

          <button type="submit" disabled={loading} className={styles.loginButton}>
            {loading ? "Accesso in corso..." : "Login"}
          </button>
        </form>

        <div className={styles.divider}>oppure</div>

        <button onClick={handleGoogleLogin} className={styles.googleButton}>
  <FcGoogle size={20} />
  Accedi con Google
</button>
      </div>
    </section>
  )
}
