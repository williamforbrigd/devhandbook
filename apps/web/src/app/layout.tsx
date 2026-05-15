import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity'
import { Header } from '../components/layout/Header'
import { SidebarContent } from '../components/layout/Sidebar'
import { MobileNav } from '../components/layout/MobileNav'
import { ThemeProvider } from '../components/layout/ThemeProvider'
import { TocProvider } from '../components/layout/TocContext'
import { fetchNavigation, fetchExpertises } from '../lib/queries'
import { SanityLive } from '../lib/live'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Handbook',
  description: 'Developer handbook',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const { isEnabled: isDraftMode } = await draftMode()
  const [navigation, expertises] = await Promise.all([
    fetchNavigation(),
    fetchExpertises(),
  ])

  return (
    <html lang="no" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Inline script: apply dark class before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var t=localStorage.getItem('handbook-theme');
  if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches))
    document.documentElement.classList.add('dark');
})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <TocProvider>
          {/* Header */}
          <Header />

          {/* Three-column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'var(--sidebar-width) 1fr var(--toc-width)',
              minHeight: '100vh',
              paddingTop: 'var(--header-height)',
            }}
          >
            {/* Left sidebar — desktop only */}
            <aside
              className="hide-below-lg"
              style={{
                position: 'sticky',
                top: 'var(--header-height)',
                height: 'calc(100vh - var(--header-height))',
                borderRight: '1px solid var(--color-border)',
                background: 'var(--color-bg-subtle)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <SidebarContent navigation={navigation} expertises={expertises} />
            </aside>

            {/* Main content */}
            <main style={{ minWidth: 0, padding: '40px clamp(16px, 4vw, 48px)' }}>
              {children}
            </main>

            {/* Right sidebar — ToC injected by individual pages via portal */}
            <aside
              id="toc-sidebar"
              className="hide-below-lg"
              style={{
                position: 'sticky',
                top: 'var(--header-height)',
                height: 'calc(100vh - var(--header-height))',
                overflowY: 'auto',
                padding: '32px 16px',
                borderLeft: '1px solid var(--color-border)',
              }}
            />
          </div>

          {/* Mobile drawer with state */}
          <MobileNav navigation={navigation} expertises={expertises} />

          <SanityLive />
          {isDraftMode && <VisualEditing />}
          </TocProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

