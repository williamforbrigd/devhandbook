import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity'
import { Header } from '../components/layout/Header'
import { SidebarContent } from '../components/layout/Sidebar'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { MobileNav } from '../components/layout/MobileNav'
import { ThemeProvider } from '../components/layout/ThemeProvider'
import { TocProvider } from '../components/layout/TocContext'
import { fetchNavigation, fetchExpertises, fetchAllGuidesForSidebar } from '../lib/queries'
import { SanityLive } from '../lib/live'
import { APP_VERSION_LABEL } from '../lib/version'
import './globals.css'

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
  const [navigation, expertises, guides] = await Promise.all([
    fetchNavigation(),
    fetchExpertises(),
    fetchAllGuidesForSidebar(),
  ])

  return (
    <html lang="no" suppressHydrationWarning data-scroll-behavior="smooth">
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
      <body className="hb">
        <ThemeProvider>
          <TocProvider>
            <div className="hb-shell hb-shell--desktop hb-shell--three">
              <SidebarContent navigation={navigation} expertises={expertises} guides={guides} />

              <div className="hb-pane hb-pane--with-toc">
                <div className="hb-main">
                  <Header />
                  <Breadcrumb />
                  <div className="hb-main__inner">{children}</div>
                  <footer className="hb-foot">
                    <span>Internal POC · Dev Handbook · {APP_VERSION_LABEL}</span>
                  </footer>
                </div>

                <aside id="toc-sidebar" className="hb-toc" aria-label="On this page" />
              </div>
            </div>

            <div className="show-below-lg">
              <MobileNav navigation={navigation} expertises={expertises} guides={guides} />
            </div>

            <SanityLive />
            {isDraftMode && <VisualEditing />}
          </TocProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

