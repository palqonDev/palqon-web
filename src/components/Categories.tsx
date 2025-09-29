"use client"

import styles from "./Categories.module.css"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const categories = [
  { icon: "📍", label: "Location", value: "LOCATION" },
  { icon: "🎤", label: "Audio", value: "AUDIO" },
  { icon: "💡", label: "Luci", value: "LUCI" },
  { icon: "🎪", label: "Palchi", value: "PALCHI" },
  { icon: "🎭", label: "Artisti", value: "ARTISTI" },
  { icon: "📦", label: "Bundle", value: "BUNDLE" },
  { icon: "➕", label: "Altro", value: "ALTRO" },
]

export default function Categories() {
  const router = useRouter()

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Categorie</h2>
      <div className={styles.grid}>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.label}
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push(`/components?category=${cat.value}`)}
          >
            <span className={styles.icon}>{cat.icon}</span>
            <p className={styles.label}>{cat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
