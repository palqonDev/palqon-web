"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"
import styles from "./Register.module.css"
import PlacesAutocomplete, { geocodeByAddress } from "react-places-autocomplete"
import { FcGoogle } from "react-icons/fc"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("client")

  const [company, setCompany] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/

  const europeanCountries = [
    { code: "IT", name: "Italia", flag: "🇮🇹" },
    { code: "FR", name: "Francia", flag: "🇫🇷" },
    { code: "DE", name: "Germania", flag: "🇩🇪" },
    { code: "ES", name: "Spagna", flag: "🇪🇸" },
    { code: "PT", name: "Portogallo", flag: "🇵🇹" },
    { code: "CH", name: "Svizzera", flag: "🇨🇭" },
    { code: "AT", name: "Austria", flag: "🇦🇹" },
    { code: "BE", name: "Belgio", flag: "🇧🇪" },
    { code: "NL", name: "Paesi Bassi", flag: "🇳🇱" },
    { code: "DK", name: "Danimarca", flag: "🇩🇰" },
    { code: "SE", name: "Svezia", flag: "🇸🇪" },
    { code: "NO", name: "Norvegia", flag: "🇳🇴" },
    { code: "FI", name: "Finlandia", flag: "🇫🇮" },
    { code: "PL", name: "Polonia", flag: "🇵🇱" },
    { code: "CZ", name: "Repubblica Ceca", flag: "🇨🇿" },
    { code: "HU", name: "Ungheria", flag: "🇭🇺" },
    { code: "GR", name: "Grecia", flag: "🇬🇷" },
    { code: "IE", name: "Irlanda", flag: "🇮🇪" },
    { code: "UK", name: "Regno Unito", flag: "🇬🇧" },
  ]

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    if (password !== confirmPassword) {
      setErrorMsg("Le password non corrispondono.")
      setLoading(false)
      return
    }

    if (!passwordRegex.test(password)) {
      setErrorMsg("La password deve avere almeno 8 caratteri, una maiuscola e un carattere speciale.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      if (error.message.includes("already registered")) {
        setErrorMsg("Questa email è già registrata. Accedi invece.")
      } else {
        setErrorMsg(error.message)
      }
      setLoading(false)
      return
    }

    const userId = data.user?.id

    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId,
        name,
        email,
        role,
        company_name: role === "seller" ? company : null,
        state,
        city,
        avatar_url: "/default-avatar.png",
      },
    ])

    if (insertError) {
      setErrorMsg(insertError.message)
    } else {
      router.push("/auth/confirmed") // 👈 pagina conferma email
    }

    setLoading(false)
  }

  const handleGoogleRegister = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` }, // 👈 Google -> home
    })
    if (error) setErrorMsg(error.message)
  }

  const handleSelectCity = async (value: string) => {
    setCity(value)
    try {
      await geocodeByAddress(value)
    } catch (err) {
      console.error("Errore geocode:", err)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crea il tuo account</h1>
        {errorMsg && <p className={styles.error}>{errorMsg}</p>}

        <form onSubmit={handleRegister} className={styles.form}>
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
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
          <input
            type="password"
            placeholder="Conferma Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
          />

          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                value="client"
                checked={role === "client"}
                onChange={(e) => setRole(e.target.value)}
              />
              Cliente
            </label>
            <label>
              <input
                type="radio"
                value="seller"
                checked={role === "seller"}
                onChange={(e) => setRole(e.target.value)}
              />
              Seller
            </label>
          </div>

          {role === "seller" && (
            <>
              <input
                type="text"
                placeholder="Nome Azienda"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className={styles.input}
              />

              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className={styles.input}
              >
                <option value="">Seleziona Stato</option>
                {europeanCountries.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>

              <PlacesAutocomplete
                value={city}
                onChange={setCity}
                onSelect={handleSelectCity}
                searchOptions={{ types: ["(cities)"] }}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <div>
                    <input
                      {...getInputProps({
                        placeholder: "Città",
                        className: styles.input,
                      })}
                      required
                    />
                    <div style={{ background: "#1e293b", borderRadius: "0.5rem", marginTop: "0.5rem" }}>
                      {loading && <div style={{ padding: "0.5rem" }}>Caricamento...</div>}
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          {...getSuggestionItemProps(s)}
                          style={{
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #334155",
                          }}
                        >
                          {s.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            </>
          )}

          <button type="submit" disabled={loading} className={styles.registerButton}>
            {loading ? "Registrazione in corso..." : "Registrati"}
          </button>
        </form>

        <div className={styles.divider}>oppure</div>

        <button onClick={handleGoogleRegister} className={styles.googleButton}>
  <FcGoogle size={20} />
  Registrati con Google
</button>
      </div>
    </section>
  )
}
