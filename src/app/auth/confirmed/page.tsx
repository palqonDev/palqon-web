import styles from "./Confirmed.module.css"

export default function ConfirmedPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>📩 Conferma la tua email</h1>
        <p className={styles.text}>
          Ti abbiamo inviato un link di conferma. <br />
          Cliccalo per completare la registrazione e accedere a <strong>PalqOn</strong> 🚀
        </p>
      </div>
    </section>
  )
}
