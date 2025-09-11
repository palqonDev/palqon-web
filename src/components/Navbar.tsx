"use client"

import Link from "next/link"
import Image from "next/image"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0B0E17]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo a sinistra */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="PalqOn Logo"
            width={140}
            height={40}
            priority
          />
        </Link>

        {/* Bottoni a destra */}
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="bg-[#007BFF] hover:bg-[#00AFFF] text-white px-5 py-2 rounded-lg shadow transition"
          >
            LOGIN
          </Link>
          <Link
            href="/auth/register"
            className="bg-[#FF006E] hover:bg-[#FF4DA0] text-white px-5 py-2 rounded-lg shadow transition"
          >
            VUOI DIVENTARE UN SELLER?
          </Link>
        </div>
      </div>
    </nav>
  )
}
