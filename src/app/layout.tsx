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
      <body className={poppins.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
