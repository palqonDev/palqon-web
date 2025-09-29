import styles from "./Footer.module.css"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* Logo + descrizione */}
        <div>
          <Link href="/">
            <Image src="/logo.png" alt="PalqOn Logo" width={160} height={50} className={styles.logo} />
          </Link>
          <p className={styles.description}>
            La piattaforma digitale per organizzare eventi indimenticabili:
            location, audio, luci, palchi e artisti in un click.
          </p>
        </div>

        {/* Navigazione */}
        <div>
          <h4>Categorie</h4>
          <ul>
            <li><Link href="/components?category=location">Location</Link></li>
            <li><Link href="/components?category=audio">Audio</Link></li>
            <li><Link href="/components?category=luci">Luci</Link></li>
            <li><Link href="/components?category=palchi">Palchi</Link></li>
            <li><Link href="/components?category=artisti">Artisti</Link></li>
            <li><Link href="/components?category=altro">Altro</Link></li>
          </ul>
        </div>

        {/* Link legali */}
        <div>
          <h4>Legale</h4>
          <ul>
            <li><Link href="/terms">Termini e condizioni</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/cookie">Cookie Policy</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Contatti */}
        <div>
          <h4>Contatti</h4>
          <ul>
            <li>📧 <a href="mailto:info@palqon.com">info@palqon.com</a></li>
            <li>📞 <a href="tel:+390123456789">+39 012 3456789</a></li>
            <li>📍 Milano, Italia</li>
          </ul>
        </div>

        {/* Social + Newsletter */}
        <div>
          <h4>Seguici</h4>
          <div className={styles.socials}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">📱</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">📘</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">🐦</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">💼</a>
          </div>
          <form className={styles.newsletter}>
            <input type="email" placeholder="Inserisci la tua email" />
            <button type="submit">Iscriviti</button>
          </form>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>© {new Date().getFullYear()} PalqOn. Tutti i diritti riservati. | P.IVA 12345678901</p>
      </div>
    </footer>
  )
}
