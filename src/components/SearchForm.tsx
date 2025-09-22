import styles from './SearchForm.module.css';

export default function SearchForm() {
  return (
    <section className={styles.section}>
      <form className={styles.grid}>
        <input type="text" placeholder="📍 Luogo" className={styles.input} />
        <input type="date" placeholder="Data Inizio" className={styles.input} />
        <input type="date" placeholder="Data Fine" className={styles.input} />
        <input type="time" placeholder="Ora Inizio" className={styles.input} />
        <input type="time" placeholder="Ora Fine" className={styles.input} />
      </form>
    </section>
  );
}
