import styles from "./Offers.module.css"

export default function Offers() {
  return (
    <section className={styles.offers}>
      <h2 className={styles.title}>Offerte speciali</h2>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>-20% su palchi modulari</h3>
          <p>Promo valida fino al 31 ottobre</p>
        </div>
        <div className={styles.card}>
          <h3>Noleggio luci LED</h3>
          <p>3 giorni al prezzo di 2</p>
        </div>
        <div className={styles.card}>
          <h3>Audio Premium</h3>
          <p>RCF e Martin Audio scontati</p>
        </div>
      </div>
    </section>
  )
}
