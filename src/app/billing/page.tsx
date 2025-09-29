"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/supabaseClient";
import styles from "./Billing.module.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

function SaveCardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/save_card", { method: "POST" });
      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });

      if (result.error) {
        setMessage(result.error.message || "Errore");
        setLoading(false);
        return;
      }

      const pm = result.setupIntent.payment_method as string;
      const { paymentMethod } = await stripe.retrievePaymentMethod(pm);

      if (paymentMethod?.card) {
        const { brand, last4 } = paymentMethod.card;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase
            .from("users")
            .update({
              card_payment_method_id: pm,
              card_brand: brand,
              card_last4: last4,
            })
            .eq("id", session.user.id);
        }
        setMessage(`Carta ${brand?.toUpperCase()} •••• ${last4} salvata ✅`);
      }
    } catch (err: any) {
      setMessage(err.message || "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label>Aggiungi o aggiorna carta</label>
      <div className={styles.cardBox}>
        <CardElement options={{ style: { base: { fontSize: "16px", color: "#fff" } } }} />
      </div>
      <button type="submit" disabled={!stripe || loading} className={styles.saveBtn}>
        {loading ? "Salvataggio..." : "Salva carta"}
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
}

export default function BillingPage() {
  return (
    <div className={styles.container}>
      <h2>Metodo di pagamento</h2>
      <Elements stripe={stripePromise}>
        <SaveCardForm />
      </Elements>
    </div>
  );
}

