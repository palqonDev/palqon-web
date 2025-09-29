"use client"

import styles from "./WhyPalqOn.module.css"
import { motion } from "framer-motion"

const features = [
  {
    icon: "🔒",
    title: "Pagamenti sicuri",
    text: "Checkout gestito da Stripe con protezione completa."
  },
  {
    icon: "📞",
    title: "Supporto h24",
    text: "Assistenza clienti rapida e sempre disponibile."
  },
  {
    icon: "🎉",
    title: "Eventi memorabili",
    text: "Dai matrimoni ai festival: attrezzature professionali."
  },
  {
    icon: "⭐",
    title: "Recensioni reali",
    text: "Feedback autentico da organizzatori e seller verificati."
  },
]

export default function WhyPalqOn() {
  return (
    <section className={styles.why}>
      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        Perché scegliere <span className={styles.brand}>PalqOn</span>
      </motion.h2>
      <div className={styles.grid}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
          >
            <div className={styles.icon}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
