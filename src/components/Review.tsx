import styles from './Review.module.css'

type Review = {
  id: string
  rating: number
  comment: string
  users: { name: string }
}

export default function ReviewList({ data }: { data: Review[] }) {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Cosa dicono i clienti</h2>
      <div className={styles.grid}>
        {data.map((r) => (
          <div key={r.id} className={styles.card}>
            <p className={styles.stars}>{"⭐".repeat(r.rating)}</p>
            <p className={styles.comment}>"{r.comment}"</p>
            <p className={styles.user}>– {r.users?.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
