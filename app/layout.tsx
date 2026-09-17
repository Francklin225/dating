import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foi & Cœur - Rencontres Chrétiennes Sérieuses',
  description: 'Plateforme de rencontres chrétiennes pour le mariage sérieux',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}