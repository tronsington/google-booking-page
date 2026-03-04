import './globals.css'

export const metadata = {
  title: 'Book a Meeting',
  description: 'Schedule a meeting',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
