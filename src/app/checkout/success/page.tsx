"use client"

import { Suspense } from "react"
import SuccessPageContent from "./SuccessPageContent"

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <SuccessPageContent />
    </Suspense>
  )
}

