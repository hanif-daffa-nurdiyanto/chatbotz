import { createFileRoute, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { UserButton, useUser } from '@clerk/clerk-react'
import { LayoutDashboard, Bot, Loader2, Menu, X, BookOpenText } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: '/login', replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080d1f]">
        <Loader2 className="w-8 h-8 text-[#6c63ff] animate-spin" />
      </div>
    )
  }

  if (!isSignedIn) return null

  return (
    <div className="flex min-h-screen bg-[#080d1f] text-white overflow-hidden selection:bg-[#6c63ff] selection:text-white">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-[#0c1228]/90 backdrop-blur-xl">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 active:scale-95 transition"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
            <span className="text-xl">🤖</span>
            <span className="font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Chatbotz
            </span>
          </Link>

          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-9 h-9 border-2 border-[#6c63ff]' } }} />
        </div>
      </header>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div className="md:static">
        {/* Mobile Overlay */}
        <button
          type="button"
          className={[
            'md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity',
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          ].join(' ')}
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu overlay"
        />

        <aside
          className={[
            'fixed md:sticky md:top-0 z-50 md:z-10 inset-y-0 left-0 w-72 md:w-64 border-r border-white/10 bg-[#0c1228] flex flex-col backdrop-blur-xl transition-transform duration-300 h-screen shrink-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
          aria-label="Admin navigation"
        >
          {/* Mobile top row inside drawer */}
          <div className="md:hidden h-14 px-4 flex items-center justify-between border-b border-white/10">
            <span className="font-semibold text-gray-200">Menu</span>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 active:scale-95 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <Link to="/" className="hidden md:flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Chatbotz
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-0 md:mt-4">
            <Link
              to="/admin/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 [&.active]:bg-gradient-to-r [&.active]:from-[#6c63ff]/20 [&.active]:to-transparent [&.active]:text-[#6c63ff] [&.active]:border-l-2 [&.active]:border-[#6c63ff]"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              to="/admin/bots"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 [&.active]:bg-gradient-to-r [&.active]:from-[#00d4ff]/20 [&.active]:to-transparent [&.active]:text-[#00d4ff] [&.active]:border-l-2 [&.active]:border-[#00d4ff]"
            >
              <Bot className="w-5 h-5" />
              <span className="font-medium">My Bots</span>
            </Link>
            <Link
              to="/admin/guide"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 [&.active]:bg-gradient-to-r [&.active]:from-white/10 [&.active]:to-transparent [&.active]:text-white [&.active]:border-l-2 [&.active]:border-white/30"
            >
              <BookOpenText className="w-5 h-5" />
              <span className="font-medium">Guide</span>
            </Link>
          </nav>

          <div className="hidden md:block p-6 border-t border-white/10">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-10 h-10 border-2 border-[#6c63ff]' } }} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Profile</span>
                <span className="text-xs text-gray-400">Manage account</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-screen overflow-y-auto pt-14 md:pt-0">
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-[#6c63ff]/10 via-[#00d4ff]/5 to-transparent pointer-events-none blur-3xl opacity-50" />
        
        <div className="p-4 sm:p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
