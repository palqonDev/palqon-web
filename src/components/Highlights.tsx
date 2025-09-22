import styles from './Highlights.module.css';

export default function Highlights() {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Palchi in evidenza</h2>
      <div className={styles.grid}>
        {[1, 2, 3].map((_, i) => (
          <div key={i} className={styles.card}>
            <h3>Palco {i + 1}</h3>
            <p>Descrizione del palco, prezzo, città...</p>
          </div>
        ))}
      </div>
    </section>
  );
}
