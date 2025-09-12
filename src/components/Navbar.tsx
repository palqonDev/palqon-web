"use client"

import Link from "next/link"
import Image from "next/image"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0B0E17]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Logo a sinistra - Più grande e centrato */}
        <Link href="/" className="flex items-center transition-all duration-300 hover:scale-105">
          <Image
            src="/logo.svg"
            alt="PalqOn Logo"
            width={180}
            height={50}
            priority
            className="object-contain"
          />
        </Link>

        {/* Bottoni a destra - Stile creativo e staccati */}
        <div className="flex gap-6 items-center">
          <Link
            href="/auth/login"
            className="bg-gradient-to-r from-[#007BFF] to-[#00AFFF] hover:from-[#00AFFF] hover:to-[#007BFF] text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform"
          >
            LOGIN
          </Link>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-[#FF006E] via-[#FF4DA0] to-[#FF80BF] hover:from-[#FF80BF] hover:via-[#FF4DA0] hover:to-[#FF006E] text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform"
          >
            VUOI DIVENTARE UN SELLER?
          </Link>
        </div>
      </div>
    </nav>
  )
}