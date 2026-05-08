import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Chatbotz — Embed AI Chatbot on Any Website' },
      { name: 'description', content: 'Chatbotz lets you deploy a powerful AI chatbot on your website in minutes. Customize with your own data, embed with one line of code, no coding expertise needed.' },
      { name: 'keywords', content: 'chatbot, AI chatbot, embed chatbot, website chatbot, customer service bot' },
      { property: 'og:title', content: 'Chatbotz — Embed AI Chatbot on Any Website' },
      { property: 'og:description', content: 'Deploy a smart AI chatbot on any website in minutes.' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>" },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
