"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  // lingua e valuta
  const [language, setLanguage] = useState("ITA")
  const [currency, setCurrency] = useState("€")

  // ref per gestire click esterni
  const dropdownRef = useRef<HTMLDivElement>(null)

  // gestione utente
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        let { data: profile } = await supabase
          .from("users")
          .select("id, name, avatar_url, role, email")
          .eq("id", session.user.id)
          .single()

        if (!profile) {
          const { data: existingByEmail } = await supabase
            .from("users")
            .select("id, name, avatar_url, role, email")
            .eq("email", session.user.email)
            .single()

          if (existingByEmail) {
            await supabase
              .from("users")
              .update({ id: session.user.id })
              .eq("email", session.user.email)
            profile = { ...existingByEmail, id: session.user.id }
          } else {
            const { data: inserted } = await supabase
              .from("users")
              .insert([
                {
                  id: session.user.id,
                  name: session.user.user_metadata.full_name || "Utente",
                  email: session.user.email,
                  role: "client",
                  avatar_url:
                    session.user.user_metadata.avatar_url ||
                    "/default-avatar.png",
                },
              ])
              .select("id, name, avatar_url, role, email")
              .single()

            profile = inserted
          }
        }
        if (profile) setUser({ ...session.user, ...profile })
      } else {
        setUser(null)
      }
    }

    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // chiusura dropdown cliccando fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.container} ref={dropdownRef}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="Palqon" className={styles.logoImage} />
        </Link>

        {/* FAQ */}
        <Link href="/faq" className={styles.faq}>
          <span className={styles.faqIcon}>?</span>
        </Link>

        {/* NEWS TICKER */}
        <div className={styles.newsTicker}>
          <div className={styles.tickerContent}>
            <span>🎧 Nuovo mixer Pioneer DJM-A9 disponibile</span>
            <span>🎶 Tomorrowland 2026 annuncia le prime date</span>
            <span>🔊 Martin Audio lancia nuova linea subwoofer</span>
            <span>💡 Novità: teste mobili LED super compatte</span>
          </div>
        </div>

        {/* Selettori lingua e valuta */}
        <div className={styles.selectors}>
          {/* Lingua */}
          <div className={styles.profile}>
            <div
              onClick={() =>
                setDropdownOpen(dropdownOpen === "lang" ? null : "lang")
              }
              className={styles.profileInfo}
            >
              <span className={styles.greeting}>
                {language} <span className={styles.arrow}>▾</span>
              </span>
            </div>
            {dropdownOpen === "lang" && (
              <div className={styles.dropdown}>
                <button onClick={() => setLanguage("ITA")}>ITA</button>
                <button onClick={() => setLanguage("ENG")}>ENG</button>
              </div>
            )}
          </div>

          {/* Valuta */}
          <div className={styles.profile}>
            <div
              onClick={() =>
                setDropdownOpen(dropdownOpen === "curr" ? null : "curr")
              }
              className={styles.profileInfo}
            >
              <span className={styles.greeting}>
                {currency} <span className={styles.arrow}>▾</span>
              </span>
            </div>
            {dropdownOpen === "curr" && (
              <div className={styles.dropdown}>
                <button onClick={() => setCurrency("€")}>€</button>
                <button onClick={() => setCurrency("$")}>$</button>
              </div>
            )}
          </div>
        </div>

        {/* Azioni utente */}
        {!user ? (
          <div className={styles.actions}>
            <Link href="/auth/login" className={styles.login}>
              Login
            </Link>
            <Link href="/auth/register" className={styles.register}>
              Registrati
            </Link>
          </div>
        ) : (
          <div className={styles.profile}>
            <div
              onClick={() =>
                setDropdownOpen(dropdownOpen === "user" ? null : "user")
              }
              className={styles.profileInfo}
            >
              <span className={styles.greeting}>
                Ciao, {user.name?.split(" ")[0]}{" "}
                <span className={styles.arrow}>▾</span>
              </span>
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt="avatar"
                className={styles.avatar}
              />
            </div>

            {dropdownOpen === "user" && (
              <div className={styles.dropdown}>
                <Link href="/profile">Profilo</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
