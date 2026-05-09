import { createFileRoute } from '@tanstack/react-router'
import { Code, KeyRound, Power, Shield, PlugZap } from 'lucide-react'

export const Route = createFileRoute('/admin/guide')({
  component: AdminGuidePage,
})

function AdminGuidePage() {
  return (
    <div className="space-y-8 animate-in duration-500">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Usage Guide</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            How to embed your bot, manage keys, and keep things secure.
          </p>
        </div>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <PlugZap className="w-5 h-5 text-[#00d4ff]" />
          Embed Your Bot
        </h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300 leading-relaxed">
          <li>Go to <span className="font-semibold text-white">Admin → My Bots</span>.</li>
          <li>
            Click <span className="font-semibold text-white">Copy Script</span> on the bot you want to embed.
          </li>
          <li>Paste the script right before your website’s closing <span className="font-mono text-white">&lt;/body&gt;</span> tag.</li>
        </ol>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#080d1f] p-4">
          <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Example
          </div>
          <pre className="text-xs text-gray-200 overflow-x-auto">
{`<script async src="https://YOUR_DOMAIN/widget.js" data-chatbotz-bot="YOUR_BOT_ID"></script>`}
          </pre>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Note: don’t open your site from <span className="font-mono">file://</span>. Use a real URL (or localhost dev server),
          otherwise browsers will block iframes/scripts due to security origins.
        </p>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-yellow-300" />
          Providers & API Keys
        </h2>
        <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
          <p>
            In <span className="font-semibold text-white">My Bots → Edit/Create → API Key</span>, pick a provider (OpenAI or Groq),
            choose a model, and optionally paste a per-bot API key.
          </p>
          <p>
            If you don’t set a per-bot key, the embed chat uses your server environment keys (recommended).
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#080d1f] p-4">
            <div className="text-sm font-semibold text-white mb-2">OpenAI</div>
            <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
              <li>Key prefix: <span className="font-mono text-gray-200">sk-</span></li>
              <li>Set server env: <span className="font-mono text-gray-200">OPENAI_API_KEY</span></li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#080d1f] p-4">
            <div className="text-sm font-semibold text-white mb-2">Groq</div>
            <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
              <li>Key prefix: <span className="font-mono text-gray-200">gsk_</span></li>
              <li>Set server env: <span className="font-mono text-gray-200">GROQ_API_KEY</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Power className="w-5 h-5 text-green-300" />
          Online / Offline
        </h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          You can turn a bot <span className="font-semibold text-white">On/Off</span> from the bot card in <span className="font-semibold text-white">My Bots</span>.
          When a bot is <span className="font-semibold">Offline</span>, the embed widget shows offline status and blocks sending messages.
        </p>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#6c63ff]" />
          Security Tips
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300 leading-relaxed">
          <li>Prefer server-side keys. Avoid embedding secrets in public websites.</li>
          <li>Use restricted keys with minimal permissions.</li>
          <li>Rotate keys if you suspect a leak.</li>
        </ul>
      </section>
    </div>
  )
}

