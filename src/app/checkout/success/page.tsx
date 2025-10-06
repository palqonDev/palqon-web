import { Suspense } from "react"
import SuccessContent from "./SuccessContent"

export const dynamic = "force-dynamic" // evita prerender statico su Vercel

export default function CheckoutSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
      <Suspense fallback={<p>Caricamento...</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
