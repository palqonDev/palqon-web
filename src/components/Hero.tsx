import styles from "./Hero.module.css"
import { useRouter } from "next/navigation"

export default function Hero() {
  const router = useRouter()

  return (
    <section className={styles.hero}>
      <div className={styles.overlay}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Organizza eventi memorabili con attrezzature professionali
          </h1>
          <p className={styles.subtitle}>
            Palchi, audio, luci e intrattenimento: tutto in un'unica piattaforma
          </p>
          <button className={styles.cta} onClick={() => router.push("/components")}>
            Scopri i servizi
          </button>
        </div>
      </div>
    </section>
  )
}
