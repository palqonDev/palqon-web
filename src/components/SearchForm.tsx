"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./SearchForm.module.css"
import { MapPin, Calendar, ListFilter } from "lucide-react"

export default function SearchForm() {
  const router = useRouter()
  const [eventCity, setEventCity] = useState("")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [category, setCategory] = useState("all")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (eventCity) params.set("event_city", eventCity)
    if (dateStart) params.set("date_start", dateStart)
    if (dateEnd) params.set("date_end", dateEnd)
    if (category && category !== "all") params.set("category", category)
    router.push(`/components?${params.toString()}`)
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.inputGroup}>
          <MapPin className={styles.icon} size={18} />
          <input
            type="text"
            placeholder="Città evento"
            value={eventCity}
            onChange={(e) => setEventCity(e.target.value)}
            className={styles.inputStyled}
          />
        </div>

        <div className={styles.inputGroup}>
          <Calendar className={styles.icon} size={18} />
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className={styles.inputStyled}
          />
        </div>

        <div className={styles.inputGroup}>
          <Calendar className={styles.icon} size={18} />
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className={styles.inputStyled}
          />
        </div>

        <div className={styles.inputGroup}>
  <ListFilter className={styles.icon} size={18} />
  <div className={styles.selectWrapper}>
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      className={styles.selectStyled}
    >
      <option value="all">Tutte le categorie</option>
      <option value="LOCATION">Location</option>
      <option value="AUDIO">Audio</option>
      <option value="LUCI">Luci</option>
      <option value="PALCHI">Palchi</option>
      <option value="ARTISTI">Artisti</option>
      <option value="ALTRO">Altro</option>
    </select>
  </div>
</div>


        <button onClick={handleSearch} className={styles.searchButton}>
          Cerca
        </button>
      </div>
    </section>
  )
}
