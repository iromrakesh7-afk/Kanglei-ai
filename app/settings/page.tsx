'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, ArrowLeft, User, Mail, Phone, MapPin } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) {
          router.push('/sign-in')
          return
        }
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('[v0] Error fetching user:', error)
        router.push('/sign-in')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/sign-in')
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950" style={{
      background: 'linear-gradient(180deg, #000000 0%, #080a18 40%, #12162D 100%)'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-green-500/20 bg-black/80 sticky top-0 z-40">
        <Link
          href="/chat"
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-white flex-1 text-center">Settings</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-0 sm:gap-4 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
        {/* Vertical Tabs Navigation */}
        <div className="flex flex-col gap-2 min-w-max">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all rounded-lg border ${
              activeTab === 'profile'
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'text-gray-400 border-transparent hover:bg-white/5'
            }`}
          >
            <User size={16} className="mr-2 inline" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all rounded-lg border ${
              activeTab === 'support'
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'text-gray-400 border-transparent hover:bg-white/5'
            }`}
          >
            <Mail size={16} className="mr-2 inline" />
            Support
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col items-stretch gap-6 max-w-md w-full">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                <h2 className="text-sm font-semibold text-green-400 uppercase mb-4">Profile Information</h2>

                {user && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      <p className="text-white mt-1 break-all">{user.email}</p>
                    </div>

                    {user.name && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Name</label>
                        <p className="text-white mt-1">{user.name}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-gray-500 uppercase">User ID</label>
                      <p className="text-white/60 text-xs mt-1 font-mono break-all">{user.id}</p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">Joined</label>
                      <p className="text-white mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                <h2 className="text-sm font-semibold text-green-400 uppercase mb-4">Account</h2>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-all font-medium"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                <h2 className="text-sm font-semibold text-green-400 uppercase mb-4">Contact Us</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Email</p>
                    <a
                      href="mailto:support@kangleiai.in"
                      className="flex items-center gap-3 px-3 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg transition-all"
                    >
                      <Mail size={18} />
                      <span>support@kangleiai.in</span>
                    </a>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Phone</p>
                    <a
                      href="tel:+919863145283"
                      className="flex items-center gap-3 px-3 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg transition-all"
                    >
                      <Phone size={18} />
                      <span>+91 9863 145283</span>
                    </a>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Location</p>
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 text-white border border-white/20 rounded-lg">
                      <MapPin size={18} className="text-green-400" />
                      <span>Manipur, India</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                <h2 className="text-sm font-semibold text-green-400 uppercase mb-4">Support Hours</h2>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white">Available 24/7</p>
                    <p className="text-xs text-gray-500 mt-1">We&apos;re here to help you anytime</p>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      For technical support, feature requests, or any inquiries, feel free to reach out using the contact information above.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* App Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center">
            <h2 className="text-sm font-semibold text-green-400 uppercase mb-2">Kanglei AI</h2>
            <p className="text-xs text-gray-500">Version 1.0.0</p>
            <p className="text-xs text-gray-600 mt-2">Your personal AI assistant</p>
          </div>
        </div>
      </div>
    </div>
  )
}
