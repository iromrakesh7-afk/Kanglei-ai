'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Info, LogOut, Mail, MapPin, Phone, ShieldCheck, User, LifeBuoy } from 'lucide-react'

const tabs = [
  { id: 'profile', label: 'Profile', description: 'Account details', icon: User },
  { id: 'support', label: 'Support', description: 'Get help from Kanglei', icon: LifeBuoy },
]

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
    return <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/50">Loading your settings...</div>
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link href="/chat" aria-label="Back to chat" className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00d4ff]">Kanglei AI</p>
            <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8 lg:flex-row lg:gap-14 lg:py-12">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Account settings</h2>
            <p className="mt-1 text-sm leading-6 text-white/40">Manage your account and find help when you need it.</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Settings sections">
            {tabs.map(({ id, label, description, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`flex min-w-max items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${activeTab === id ? 'border-[#00d4ff]/30 bg-[#00d4ff]/10 text-white' : 'border-transparent text-white/45 hover:border-white/10 hover:bg-white/5 hover:text-white'}`}>
                <Icon className={activeTab === id ? 'text-[#00d4ff]' : 'text-white/45'} />
                <span><span className="block text-sm font-medium">{label}</span><span className="hidden text-xs text-white/35 sm:block">{description}</span></span>
                <ChevronRight className="ml-auto hidden size-4 lg:block" />
              </button>
            ))}
          </nav>
        </aside>

        <section className="w-full max-w-2xl">
          {activeTab === 'profile' ? (
            <div className="flex flex-col gap-5">
              <div className="rounded-3xl border border-white/10 bg-[#111112] p-5 sm:p-7">
                <div className="mb-7 flex items-center gap-4"><div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a5c3a] to-[#00d4ff] text-xl font-semibold text-black">{user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'K'}</div><div><h2 className="text-lg font-semibold">Profile information</h2><p className="text-sm text-white/40">Your personal account details.</p></div></div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Email</p><p className="mt-2 break-all text-sm text-white/85">{user?.email || '—'}</p></div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Name</p><p className="mt-2 text-sm text-white/85">{user?.name || 'Not set'}</p></div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4 sm:col-span-2"><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Member since</p><p className="mt-2 text-sm text-white/85">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p></div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#111112] p-5 sm:p-7"><div className="mb-5 flex items-center gap-3"><ShieldCheck className="text-[#00d4ff]" /><div><h2 className="font-semibold">Account access</h2><p className="text-sm text-white/40">Securely end your current session.</p></div></div><button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-400/15"><LogOut /> Sign out</button></div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm text-white/45"><Info className="mt-0.5 size-4 shrink-0 text-white/55" /><p>Your account helps Kanglei AI keep your chats and preferences connected across sessions.</p></div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="rounded-3xl border border-white/10 bg-[#111112] p-5 sm:p-7"><div className="mb-7"><h2 className="text-lg font-semibold">Contact support</h2><p className="mt-1 text-sm text-white/40">We&apos;re here to help with questions, feedback, or feature requests.</p></div><div className="flex flex-col gap-3"><a href="mailto:support@kangleiai.in" className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 transition hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/5"><Mail className="text-[#00d4ff]" /><span><span className="block text-sm font-medium">Email us</span><span className="text-xs text-white/40">support@kangleiai.in</span></span><ChevronRight className="ml-auto size-4 text-white/35" /></a><a href="tel:+919863145283" className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 transition hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/5"><Phone className="text-[#00d4ff]" /><span><span className="block text-sm font-medium">Call support</span><span className="text-xs text-white/40">+91 9863 145283</span></span><ChevronRight className="ml-auto size-4 text-white/35" /></a><div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4"><MapPin className="text-[#00d4ff]" /><span><span className="block text-sm font-medium">Based in</span><span className="text-xs text-white/40">Manipur, India</span></span></div></div></div>
              <div className="rounded-3xl border border-white/10 bg-[#111112] p-5 sm:p-7"><h2 className="font-semibold">Availability</h2><p className="mt-2 text-sm text-white/45">Support is available 24/7. We&apos;ll get back to you as soon as possible.</p></div>
            </div>
          )}
          <p className="mt-8 text-center text-xs text-white/25">Kanglei AI · Version 1.0.0</p>
        </section>
      </div>
    </main>
  )
}
