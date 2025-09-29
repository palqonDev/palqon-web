"use client"

import { useState } from "react"
import styles from "./Faq.module.css"

type FAQ = {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: "Che cos'è PalqOn?",
    answer:
      "PalqOn è la piattaforma online per prenotare service, audio, luci, palchi e attrezzature per eventi. Funziona come Booking.com, ma è dedicata al mondo degli eventi.",
  },
  {
    question: "Come funziona il processo di prenotazione?",
    answer:
      "Il cliente seleziona il servizio o l'attrezzatura, inserisce le date e procede al checkout. La prenotazione diventa valida solo dopo il pagamento confermato tramite Stripe.",
  },
  {
    question: "Quando vengono aggiornati i miei guadagni o le spese?",
    answer:
      "Gli importi nel profilo vengono aggiornati soltanto dopo che Stripe conferma il pagamento. Prima di quel momento la prenotazione rimane in stato pending.",
  },
  {
    question: "Come vengono gestiti i pagamenti?",
    answer:
      "PalqOn utilizza Stripe Checkout per garantire sicurezza e affidabilità. Tutti i pagamenti sono processati in maniera tracciata e sicura.",
  },
  {
    question: "Posso cancellare una prenotazione?",
    answer:
      "Le cancellazioni sono gestite in base ai termini di servizio e allo stato della prenotazione. Se la prenotazione non è stata ancora confermata o pagata, può essere annullata senza costi.",
  },
  {
    question: "Chi può diventare seller su PalqOn?",
    answer:
      "Chiunque fornisca servizi o attrezzature per eventi può registrarsi come seller. È richiesto completare il profilo aziendale e fornire i dati fiscali.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Domande frequenti (FAQ)</h1>
      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <button
              className={styles.question}
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className={styles.icon}>
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <p className={styles.answer}>{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
