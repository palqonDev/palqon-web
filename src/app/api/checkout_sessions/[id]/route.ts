import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-09-30",
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await stripe.checkout.sessions.retrieve(params.id);
    return NextResponse.json(session);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
