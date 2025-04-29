'use client'

import { ThemeProvider } from './mobile/src/context/ThemeContext'
import { AuthProvider } from './mobile/src/context/AuthContext'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            {/* Your web app content */}
          </main>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App 