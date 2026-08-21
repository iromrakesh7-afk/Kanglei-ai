'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, LogOut, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { ProfileModal } from './profile-modal'

interface Conversation {
  id: string
  title: string
  createdAt: string
}

interface ChatSidebarProps {
  conversations: Conversation[]
  onNewChat: () => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
  isHeaderMenu?: boolean
}

export function ChatSidebar({ conversations, onNewChat, user, isHeaderMenu }: ChatSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in')
          router.refresh()
        },
      },
    })
  }

  const sidebarContent = (
    <>
      <div className="flex flex-col h-full bg-sidebar">
        {/* Header with Kanglei Branding */}
        <div className="p-4 border-b border-green-500/10 flex items-center gap-3">
          <div className="size-9 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0 border border-border">
            <img src="/kanglei-new-logo.png" alt="Kanglei AI" className="size-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">Kanglei AI</h2>
            <p className="text-xs text-gray-400">by Rakesh Irom</p>
          </div>
        </div>

        {/* New Chat Button - Gemini Style */}
        <div className="p-4 border-b border-green-500/10">
          <Button
            onClick={onNewChat}
            className="w-full bg-green-500 hover:bg-green-600 text-black rounded-lg py-2 px-3 flex items-center justify-center gap-2 font-medium transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>

        {/* Conversations List - Gemini Style */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length > 0 && (
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide px-3 mb-3 mt-2">
              Recent
            </p>
          )}
          
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-500 px-3 py-8 text-center">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-all truncate ${
                  pathname === `/chat/${conv.id}`
                    ? 'bg-green-500/15 text-green-300 font-medium'
                    : 'text-gray-300 hover:bg-slate-800/50 hover:text-foreground'
                }`}
                title={conv.title}
              >
                {conv.title}
              </Link>
            ))
          )}
        </div>

        {/* Footer - User Options */}
        <div className="border-t border-green-500/10 p-3 space-y-1">
          <Button
            onClick={() => setIsProfileOpen(true)}
            variant="ghost"
            className="w-full text-gray-300 hover:text-foreground hover:bg-slate-800/50 text-sm rounded-lg py-2 px-3 flex items-center justify-start gap-3"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-gray-300 hover:text-red-400 hover:bg-slate-800/50 text-sm rounded-lg py-2 px-3 flex items-center justify-start gap-3"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </>
  )

  // If this is header menu mode, only show the toggle button
  if (isHeaderMenu) {
    return (
      <>
        {/* Mobile Menu Toggle Button - In Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-foreground p-2 rounded-lg transition-all"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile Sidebar Overlay - Full screen when open */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
            />
            {/* Sidebar Panel */}
            <aside className="fixed left-0 top-0 z-30 bg-sidebar border-r border-green-500/10 w-64 h-screen flex flex-col overflow-hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-foreground z-40 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex-1 overflow-y-auto mt-2">
                {sidebarContent}
              </div>
            </aside>
          </>
        )}

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
        />
      </>
    )
  }

  return (
    <>
      {/* Desktop Sidebar - Gemini Style */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-green-500/10 h-screen flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay - Full screen when open */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-20 lg:hidden bg-black/50 backdrop-blur-sm"
          />
          {/* Sidebar Panel */}
          <aside className="fixed left-0 top-0 z-30 lg:hidden bg-sidebar border-r border-green-500/10 w-64 h-screen flex flex-col overflow-hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-foreground z-40 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 overflow-y-auto mt-2">
              {sidebarContent}
            </div>
          </aside>
        </>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />
    </>
  )
}
