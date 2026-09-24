'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, ChevronRight, CircleHelp, ClipboardList, Clock3, CreditCard, Database, Info, Languages, LayoutGrid, LifeBuoy, LogOut, LockKeyhole, Mail, Palette, PanelLeft, Phone, RefreshCw, ShieldCheck, SlidersHorizontal, Sparkles, Volume2, WalletCards, Wrench, Waves, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type SettingItem = [string, string, string, LucideIcon]
type SettingGroup = { title: string; items: SettingItem[] }

const groups: SettingGroup[] = [
  { title: 'Customize Kanglei AI', items: [
    ['personalization', 'Personalization', 'Customize how Kanglei AI responds to you', Sparkles],
    ['memory', 'Memory', 'Manage what Kanglei AI remembers', Database],
    ['language', 'Language', 'English', Languages],
    ['voice', 'Voice', 'Configure voice conversations', Volume2],
  ]},
  { title: 'Account', items: [
    ['account', 'Email', 'rakeshirom@example.com', Mail],
    ['subscription', 'Subscription', 'Free', CreditCard],
    ['upgrade', 'Upgrade Plan', 'Unlock additional Kanglei AI features', WalletCards],
    ['security', 'Login & Security', 'Manage account security', LockKeyhole],
  ]},
  { title: 'Appearance', items: [
    ['appearance', 'Appearance', 'System', Palette],
    ['accent', 'Accent Color', 'Blue', Waves],
    ['theme', 'Chat Theme', 'Dark', LayoutGrid],
  ]},
  { title: 'App Settings', items: [
    ['general', 'General', 'Configure general application behavior', SlidersHorizontal],
    ['notifications', 'Notifications', 'Manage alerts and notifications', Bell],
    ['storage', 'Storage', 'Manage application storage', Database],
    ['data', 'Data Controls', 'Manage chat and account data', RefreshCw],
    ['remote', 'Remote Control', 'Manage connected devices', PanelLeft],
  ]},
  { title: 'Help & Support', items: [
    ['help', 'Help Center', 'Find answers and learn about Kanglei AI', CircleHelp],
    ['privacy', 'Privacy Center', 'Understand your privacy choices', ShieldCheck],
    ['about', 'About Kanglei AI', 'Intelligence from Manipur, built for the world', Info],
    ['support', 'Contact Support', 'Get help with your account', LifeBuoy],
  ]},
]

const detailCopy: Record<string, { title: string; description: string; rows: [string, string, 'toggle' | 'link'][] }> = {
  personalization: { title: 'Personalization', description: 'Customize how Kanglei AI communicates with you.', rows: [['Response style', 'Balanced', 'link'], ['Tone', 'Friendly', 'link'], ['Use simple language', 'On', 'toggle'], ['Explain technical concepts', 'On', 'toggle'], ['Use examples', 'On', 'toggle'], ['Remember preferences', 'On', 'toggle']] },
  memory: { title: 'Memory', description: 'Kanglei AI can use saved preferences to provide more relevant responses.', rows: [['Memory', 'On', 'toggle'], ['Use conversation history', 'On', 'toggle'], ['Show memory information', 'View saved memories', 'link'], ['Memory summary', 'Review', 'link'], ['Clear conversation history', 'Delete', 'link']] },
  language: { title: 'Language', description: 'Choose how Kanglei AI speaks and displays information.', rows: [['App language', 'English', 'link'], ['Manipuri Chat', 'On', 'toggle'], ['Manipuri Speech Recognition', 'Off', 'toggle'], ['Manipuri Text-to-Speech', 'Off', 'toggle'], ['Meitei Mayek Support', 'On', 'toggle']] },
  voice: { title: 'Voice', description: 'Configure natural voice conversations with Kanglei AI.', rows: [['Voice conversations', 'On', 'toggle'], ['Hands-free mode', 'Off', 'toggle'], ['Background conversations', 'Off', 'toggle'], ['Voice selection', 'KAI Voice 01', 'link'], ['Speaking speed', '1.0x', 'link']] },
  general: { title: 'General', description: 'Configure general application behavior.', rows: [['Start new chat automatically', 'On', 'toggle'], ['Open last conversation', 'On', 'toggle'], ['Send messages with Enter', 'On', 'toggle'], ['Show message timestamps', 'Off', 'toggle'], ['Haptic feedback', 'On', 'toggle'], ['Animations', 'On', 'toggle'], ['Default response style', 'Balanced', 'link']] },
  notifications: { title: 'Notifications', description: 'Choose which alerts Kanglei AI can send you.', rows: [['Push notifications', 'On', 'toggle'], ['Chat responses', 'On', 'toggle'], ['Voice notifications', 'Off', 'toggle'], ['Scheduled tasks', 'On', 'toggle'], ['Security alerts', 'On', 'toggle'], ['Product updates', 'Off', 'toggle'], ['Notification preview', 'When unlocked', 'link']] },
  appearance: { title: 'Appearance', description: 'Make Kanglei AI feel at home on your device.', rows: [['Appearance', 'System', 'link'], ['Accent color', 'Blue', 'link'], ['Chat theme', 'Dark', 'link'], ['Font size', 'Default', 'link'], ['Reduce motion', 'Off', 'toggle']] },
  security: { title: 'Security & Login', description: 'Keep your account protected across every device.', rows: [['Google Sign-In', 'Connected', 'link'], ['Email & Password', 'Manage', 'link'], ['Two-factor authentication', 'Off', 'toggle'], ['Login activity', 'Review', 'link'], ['Active sessions', '3 devices', 'link'], ['Biometric lock', 'Off', 'toggle']] },
  data: { title: 'Data Controls', description: 'Manage your conversations and account data.', rows: [['Save chat history', 'On', 'toggle'], ['Use chat history', 'On', 'toggle'], ['Improve AI experience', 'On', 'toggle'], ['Download my data', 'Export', 'link'], ['Export conversations', 'Export', 'link'], ['Delete all conversations', 'Delete', 'link'], ['Delete account', 'Delete', 'link']] },
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState('profile')
  const [open, setOpen] = useState(false)
  const [toggles, setToggles] = useState<Record<string, boolean>>({})
  const router = useRouter()

  useEffect(() => {
    fetch('/api/user').then(async (response) => { if (!response.ok) { router.push('/sign-in'); return }; const data = await response.json(); setUser(data.user) }).catch(() => router.push('/sign-in')).finally(() => setLoading(false))
  }, [router])

  const toggle = (key: string) => setToggles((current) => ({ ...current, [key]: !(current[key] ?? true) }))
  const logout = async () => { await fetch('/api/auth/signout', { method: 'POST' }); router.push('/sign-in') }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/50">Loading your settings...</div>

  return <main className="min-h-screen bg-black text-white">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/85 px-4 py-4 backdrop-blur-xl sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><div className="flex items-center gap-3"><Link href="/chat" aria-label="Back to chat" className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10"><ArrowLeft /></Link><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#00d4ff]">Kanglei AI</p><h1 className="text-lg font-semibold">Settings</h1></div></div><button onClick={() => setOpen(!open)} aria-label="Toggle settings menu" className="rounded-full p-2 text-white/60 hover:bg-white/10 lg:hidden">{open ? <X /> : <PanelLeft />}</button></div></header>
    <div className="mx-auto flex max-w-7xl gap-10 px-4 py-7 sm:px-8 lg:py-10">
      <aside className={`${open ? 'fixed inset-x-4 top-20 z-20 block max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#101011] p-4 shadow-2xl' : 'hidden'} w-full shrink-0 lg:sticky lg:top-28 lg:block lg:w-[290px] lg:self-start lg:bg-transparent lg:p-0 lg:shadow-none`}><div className="mb-7 px-2"><h2 className="text-xl font-semibold">Account settings</h2><p className="mt-2 text-sm leading-6 text-white/40">Manage your account, preferences, privacy, and support.</p></div><nav className="flex flex-col gap-6" aria-label="Settings sections">{groups.map((group) => <div key={group.title}><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/30">{group.title}</p><div className="flex flex-col gap-1">{group.items.map(([id, label, description, Icon]) => <button key={id} onClick={() => { setActive(id); setOpen(false) }} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active === id ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}><Icon className={`size-[18px] shrink-0 ${active === id ? 'text-[#00d4ff]' : ''}`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{label}</span><span className="block truncate text-[11px] text-white/30">{description}</span></span><ChevronRight className="size-4 text-white/25" /></button>)}</div></div>)}</nav></aside>
      <section className="min-w-0 max-w-3xl flex-1">
        {active === 'profile' ? <><div className="mb-8"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#00d4ff]">Intelligent. Responsive. Connected.</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Your Kanglei AI</h2></div><div className="rounded-3xl border border-white/10 bg-[#151516] p-5 sm:p-7"><div className="flex items-center gap-4"><div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a5c3a] to-[#00d4ff] text-2xl font-semibold text-black">{user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'K'}<button aria-label="Edit profile image" className="absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded-full border-4 border-[#151516] bg-[#007aff] text-xs">+</button></div><div><h3 className="text-lg font-semibold">{user?.name || 'Rakesh Irom'}</h3><p className="text-sm text-white/45">Account settings</p><p className="mt-1 text-xs text-white/30">Manage your Kanglei AI account</p></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/[.04] p-4"><p className="text-[10px] uppercase tracking-widest text-white/30">Email</p><p className="mt-2 break-all text-sm">{user?.email || 'rakeshirom@example.com'}</p></div><div className="rounded-2xl bg-white/[.04] p-4"><p className="text-[10px] uppercase tracking-widest text-white/30">Subscription</p><p className="mt-2 text-sm">Free plan</p></div></div></div><button onClick={logout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-400/15"><LogOut /> Sign out</button></> : detailCopy[active] ? <DetailPanel config={detailCopy[active]} toggles={toggles} toggle={toggle} /> : <InfoPanel active={active} />}
      </section>
    </div>
  </main>
}

function DetailPanel({ config, toggles, toggle }: { config: { title: string; description: string; rows: [string, string, 'toggle' | 'link'][] }; toggles: Record<string, boolean>; toggle: (key: string) => void }) { return <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#00d4ff]">Kanglei AI settings</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{config.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/45">{config.description}</p><div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#151516]">{config.rows.map(([label, value, type], index) => { const key = `${config.title}-${label}`; const on = toggles[key] ?? value === 'On'; return <div key={label} className={`flex min-h-[74px] items-center gap-4 px-4 sm:px-6 ${index ? 'border-t border-white/[.07]' : ''}`}><span className="min-w-0 flex-1 text-sm font-medium">{label}</span>{type === 'toggle' ? <button role="switch" aria-checked={on} aria-label={label} onClick={() => toggle(key)} className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-[#007aff]' : 'bg-white/15'}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${on ? 'left-6' : 'left-1'}`} /></button> : <button className="flex items-center gap-2 text-right text-sm text-white/40 hover:text-white">{value}<ChevronRight className="size-4" /></button>}</div> })}</div>{config.title === 'Voice' && <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#007aff] px-5 py-3 text-sm font-semibold hover:bg-[#1685ff]"><Waves /> Test Voice</button>}{config.title === 'Data Controls' && <p className="mt-4 text-xs text-red-300/70">Destructive actions require confirmation before they can be completed.</p>}</div> }

function SupportPanel() { const items: { icon: LucideIcon; title: string; body: string; href?: string }[] = [{ icon: Clock3, title: 'Support Response Time', body: 'We aim to respond to support requests within 1–2 business days. Response times may vary depending on complexity and urgency.' }, { icon: Wrench, title: 'Technical & Account Help', body: 'Technical issues, account-related problems, and security concerns may require additional investigation.' }, { icon: ClipboardList, title: 'Help Us Help You', body: 'Include a clear description, relevant screenshots or error messages, and the email associated with your Kanglei AI account, if applicable.' }, { icon: Mail, title: 'Support Email', body: 'support@kangleiai.site', href: 'mailto:support@kangleiai.site' }, { icon: Phone, title: 'Phone Support', body: '9863765467', href: 'tel:9863765467' }] as const; return <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#00d4ff]">Kanglei AI settings</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Contact Support</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/45">Need help with Kanglei AI? Our support team is here to help with technical issues, account questions, feedback, and other concerns.</p><div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#151516]">{items.map(({ icon: Icon, title, body, href }, index) => <div key={title} className={`flex gap-4 px-5 py-5 sm:px-6 ${index ? 'border-t border-white/[.07]' : ''}`}><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[.03] text-[#00d4ff]"><Icon className="size-[18px]" strokeWidth={1.7} /></div><div className="min-w-0"><h3 className="text-sm font-medium">{title}</h3>{href ? <a href={href} className="mt-1 block text-sm text-[#5eb6ff] hover:underline">{body}</a> : <p className="mt-1 text-sm leading-6 text-white/45">{body}</p>}</div></div>)}</div></div> }

function InfoPanel({ active }: { active: string }) { if (active === 'support') return <SupportPanel />; const content: Record<string, [string, string]> = { subscription: ['Subscription', 'You are currently using the Free plan. Upgrade to unlock additional Kanglei AI features.'], upgrade: ['Upgrade Plan', 'Unlock higher limits, advanced voice conversations, and more powerful tools with Kanglei AI.'], storage: ['Storage', 'Kanglei AI Storage · 2.4 GB used'], remote: ['Remote Control', 'Manage Kanglei AI sessions across your devices. iPhone, Mac, and Web Browser are active.'], help: ['Help Center', 'Welcome to the Kanglei AI Help Center. Find answers about getting started, Manipuri support, account security, and common questions.'], privacy: ['Privacy Center', 'Privacy and responsible use of technology are essential to building trustworthy AI. Review your data choices and how conversations are handled.'], about: ['About Kanglei AI', 'Kanglei AI is intelligence from Manipur, built for the world. Founded by Rakesh Irom, KAI creates accessible, multilingual, responsive AI experiences.'], support: ['Contact Support', 'Need help with Kanglei AI? Contact support@kangleiai.site for technical issues, account questions, feedback, and feature requests.'], account: ['Account', 'Your email, account identity, and membership details are managed securely here.'], accent: ['Accent Color', 'Blue is your current accent color. Choose from Blue, Green, Gold, Purple, Orange, or Pink.'], theme: ['Chat Theme', 'Dark mode is enabled for a focused, iOS-inspired Kanglei AI experience.'] }; const [title, description] = content[active] || ['Settings', 'Manage your Kanglei AI preferences.']; return <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#00d4ff]">Kanglei AI settings</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2><div className="mt-8 rounded-3xl border border-white/10 bg-[#151516] p-6 sm:p-8"><p className="text-base leading-7 text-white/70">{description}</p>{active === 'storage' && <div className="mt-7"><div className="mb-2 flex justify-between text-xs text-white/45"><span>Storage used</span><span>24%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 w-1/4 rounded-full bg-[#007aff]" /></div></div>}{active === 'help' && <div className="mt-7 flex flex-col gap-3"><p className="text-sm font-medium">Common questions</p><p className="text-sm text-white/45">Why isn&apos;t KAI responding? Check your connection and try again.</p><p className="text-sm text-white/45">Can I communicate in Manipuri? Yes, where the feature is available.</p></div>}</div></div> }
