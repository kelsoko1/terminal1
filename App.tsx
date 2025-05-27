'use client'

import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'

function App(): JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Your web app content */}
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App 