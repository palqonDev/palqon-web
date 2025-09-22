import './globals.css'
import Navbar from '@/components/Navbar'
import Script from "next/script"

export const metadata = {
  title: 'PalqOn',
  description: 'Booking Service per eventi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        {/* Script Google Maps */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <Navbar />
        <main className="main-wrapper">{children}</main>
      </body>
    </html>
  )
}
