import "./globals.css"
import { ReactNode } from "react"
import { Poppins } from "next/font/google"
import Navbar from "../components/Navbar"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata = {
  title: "PalqOn",
  description: "Booking Service per eventi",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body className={`${poppins.className} overflow-x-hidden`}>
        <Navbar />
        <div className="w-full max-w-7xl mx-auto px-4">
          <main className="w-full">{children}</main>
        </div>
      </body>
    </html>
  )
}