"use client"

import styles from "./Review.module.css"
import { motion } from "framer-motion"
import Image from "next/image"

type Review = {
  id: string
  rating: number
  comment: string
  users: { name: string; avatar_url?: string }
  created_at?: string
}

export default function ReviewList({ data }: { data: Review[] }) {
  return (
    <section className={styles.wrapper}>
      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        Le voci della community
      </motion.h2>

      <div className={styles.grid}>
        {data.map((r, i) => (
          <motion.div
            key={r.id}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.userBox}>
              <Image
                src={r.users?.avatar_url || "/default-avatar.png"}
                alt={r.users?.name || "Utente"}
                width={40}
                height={40}
                className={styles.avatar}
              />
              <div>
                <p className={styles.user}>{r.users?.name}</p>
                {r.created_at && (
                  <p className={styles.date}>
                    {new Date(r.created_at).toLocaleDateString("it-IT")}
                  </p>
                )}
              </div>
            </div>

            <p className={styles.stars}>{"⭐".repeat(r.rating)}</p>
            <p className={styles.comment}>"{r.comment}"</p>
          </motion.div>
        ))}
      </div>

      <div className={styles.ctaBox}>
        <a href="/reviews" className={styles.ctaBtn}>
          Lascia la tua recensione
        </a>
      </div>
    </section>
  )
}
