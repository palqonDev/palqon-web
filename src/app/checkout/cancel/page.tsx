"use client";

import Link from "next/link";
import styles from "./Cancel.module.css";

export default function CancelPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>❌ Pagamento annullato</h2>
        <p>
          Il pagamento non è stato completato.  
          Puoi riprovare o scegliere un altro metodo.
        </p>
        <Link href="/cart" className={styles.btn}>
          Torna al carrello
        </Link>
      </div>
    </div>
  );
}
