import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-09-30",
});

// Stripe invia i webhook come raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") as string;
  const rawBody = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    // Gestisci i vari eventi
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Pagamento completato:", session.id);
      // TODO: aggiorna Supabase o DB
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Errore webhook Stripe:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
