import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import { Sparkles, Bot, Zap, ArrowRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useUser()
  const dbUser = useQuery(api.users.getCurrentUser)
  const bots = useQuery(api.bots.getBots)

  const isPro = dbUser?.plan === 'pro' || dbUser?.plan === 'agency'

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, <span className="bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] bg-clip-text text-transparent">{user?.firstName || 'Admin'}</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">Here's what's happening with your chatbots today.</p>
        </div>
        
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${dbUser ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
          <span className="text-sm font-medium text-gray-300">System Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#6c63ff]/20 rounded-full blur-2xl group-hover:bg-[#6c63ff]/30 transition-all" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#6c63ff]/20 rounded-xl">
              <Bot className="w-6 h-6 text-[#6c63ff]" />
            </div>
            <h3 className="text-gray-400 font-medium">Active Bots</h3>
          </div>
          <div className="text-3xl sm:text-4xl font-bold">{bots?.length ?? '-'}</div>
        </div>

        <div className="relative group overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00d4ff]/20 rounded-full blur-2xl group-hover:bg-[#00d4ff]/30 transition-all" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#00d4ff]/20 rounded-xl">
              <Zap className="w-6 h-6 text-[#00d4ff]" />
            </div>
            <h3 className="text-gray-400 font-medium">Current Plan</h3>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-3xl sm:text-4xl font-bold capitalize">{dbUser?.plan || '...'}</div>
            {isPro && <Sparkles className="w-5 h-5 text-yellow-400 mb-1" />}
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-[#6c63ff]/20 to-[#00d4ff]/20 border border-white/10 rounded-2xl p-6 hover:from-[#6c63ff]/30 hover:to-[#00d4ff]/30 transition-all duration-500 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Need more power?</h3>
            <p className="text-gray-300 text-sm">Upgrade to Pro for unlimited bots and advanced analytics.</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold bg-white text-black px-4 py-2 rounded-lg w-fit hover:scale-105 transition-transform mt-4">
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 mt-8">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/admin/bots" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg"><Bot className="w-5 h-5 text-gray-300" /></div>
              <span className="font-medium">Manage Bots</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
