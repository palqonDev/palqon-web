"use client"

import styles from "./Hero.module.css"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function Hero() {
  const router = useRouter()
  const words = ["Location", "Audio", "Luci", "Palchi", "Artisti"]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Organizza eventi <span className={styles.glow}>memorabili</span>
        </motion.h1>

        <motion.p
          key={index}
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Tutto per i tuoi eventi: <span className={styles.highlight}>{words[index]}</span>
        </motion.p>

        <motion.button
          className={styles.cta}
          whileHover={{ scale: 1.1, boxShadow: "0 0 20px #00afff" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/components")}
        >
          Scopri i servizi
        </motion.button>
      </motion.div>
    </section>
  )
}
