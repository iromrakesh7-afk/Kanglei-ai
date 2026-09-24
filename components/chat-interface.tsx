'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Send, ChevronDown, Loader2, Mic, ImageIcon, Menu, X, Plus, Search, Settings, Sparkles, Globe2, FileText, Library, FolderKanban, CalendarClock, Compass, UserRound, Volume2, Paperclip, ArrowUp } from 'lucide-react'
import Image from 'next/image'
import { ComingSoonPopup } from './coming-soon-popup'

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  conversationId: string
  conversationTitle: string
  initialMessages: Message[]
  model: string
  onNewChat: () => void
  onDeleteChat: () => void
}

const AVAILABLE_MODELS = [
  { id: 'kanglei-lite', apiModel: 'groq/openai/gpt-oss-120b', name: 'Kanglei Lite', provider: 'Kanglei', lang: 'en', disabled: false },
  { id: 'kanglei-pro', apiModel: 'groq/openai/gpt-oss-120b', name: 'Kanglei Pro', provider: 'Kanglei', lang: 'en', disabled: false },
  { id: 'kanglei-ultra', apiModel: 'groq/openai/gpt-oss-120b', name: 'Kanglei Ultra', provider: 'Kanglei', lang: 'en', disabled: false },
  { id: 'meiteilon-kanglei', apiModel: 'groq/openai/gpt-oss-120b', name: 'Meiteilon Kanglei (Coming Soon)', provider: 'Kanglei', lang: 'meiteilon', disabled: true },
]

export function ChatInterface({
  conversationId,
  conversationTitle,
  initialMessages,
  model,
  onNewChat,
  onDeleteChat,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAnswering, setIsAnswering] = useState(false)
  const [selectedModel, setSelectedModel] = useState('kanglei-lite')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showMenuDropdown, setShowMenuDropdown] = useState(false)
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [modelTransition, setModelTransition] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [selectedImageModel, setSelectedImageModel] = useState('nvidia/Picasso')
  const [showImageModelDropdown, setShowImageModelDropdown] = useState(false)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const modelDropdownRef = useRef<HTMLDivElement>(null)
  const imageModelDropdownRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const inputAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch user email and check if admin
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const data = await response.json()
          setUserEmail(data.user?.email || null)
          // Check if admin email
          if (data.user?.email === 'iromrakesh7@gmail.com') {
            setIsAdmin(true)
          }
        }
      } catch (error) {
        console.error('[v0] Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  // Detect mobile keyboard visibility and adjust layout
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      // Calculate keyboard height based on viewport changes
      const windowHeight = window.innerHeight
      const windowHeightDVH = window.visualViewport?.height || window.innerHeight
      const keyboardHeightEstimate = windowHeight - windowHeightDVH
      
      if (keyboardHeightEstimate > 50) {
        setKeyboardHeight(keyboardHeightEstimate)
        // Scroll input into view when keyboard appears
        setTimeout(() => {
          inputAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 100)
      } else {
        setKeyboardHeight(0)
      }
    }

    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])

  // Voice to text
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => setIsListening(true)
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
      setInput(transcript)
    }

    recognitionRef.current.start()
  }

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // Fetch chat history when menu opens
  useEffect(() => {
    if (showMenuDropdown && chatHistory.length === 0 && !loadingHistory) {
      const fetchHistory = async () => {
        setLoadingHistory(true)
        try {
          const response = await fetch('/api/conversations')
          if (response.ok) {
            const data = await response.json()
            setChatHistory(data)
          }
        } catch (error) {
          console.error('[v0] Error fetching chat history:', error)
        } finally {
          setLoadingHistory(false)
        }
      }
      fetchHistory()
    }
  }, [showMenuDropdown, chatHistory.length, loadingHistory])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isAnswering])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle mobile keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      if (inputAreaRef.current) {
        inputAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }

    // iOS keyboard detection
    const visualViewport = (window as any).visualViewport
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleResize)
      return () => visualViewport.removeEventListener('resize', handleResize)
    }
  }, [])

  // Define selectedModelData and selectedLanguage before useCallback
  const selectedModelData = AVAILABLE_MODELS.find(m => m.id === selectedModel)
  const selectedLanguage = selectedModelData?.lang || 'en'

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return

    // Dismiss keyboard on mobile
    if (typeof window !== 'undefined' && (document.activeElement as HTMLInputElement)?.blur) {
      (document.activeElement as HTMLInputElement).blur()
    }

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')

    // Regular chat message
    setLoading(true)
    setIsAnswering(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          model: selectedModelData?.apiModel || 'groq/openai/gpt-oss-120b',
          language: selectedLanguage,
          useSearch: false,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.content) {
        throw new Error(data.error || 'I could not generate an answer right now. Please try again.')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
      }

      setMessages([...newMessages, assistantMessage])
      setIsAnswering(false)

      // Save message to database (non-blocking)
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messages: [userMessage, assistantMessage],
        }),
      }).catch(err => console.error('[v0] Failed to save messages:', err))

      // Update conversation title if this is the first message (non-blocking)
      if (messages.length === 0) {
        const titlePreview = userMessage.content.length > 50 
          ? userMessage.content.substring(0, 50) + '...' 
          : userMessage.content
        fetch('/api/update-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            title: titlePreview,
          }),
        }).catch(err => console.error('[v0] Failed to update title:', err))
      }
    } catch (error) {
      console.error('[v0] Error:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: error instanceof Error
            ? error.message
            : 'I could not generate an answer right now. Please try again.',
        },
      ])
      setIsAnswering(false)
    } finally {
      setLoading(false)
    }
  }, [conversationId, input, messages, selectedLanguage, selectedModelData])

  const handleStartVoiceInput = useCallback(() => {
    startVoiceInput()
  }, [])

  const selectedModelName = selectedModelData?.name || 'Kanglei Pro'

  const handleNewChat = () => {
    window.location.href = '/chat'
  }

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-black text-white">
      {isDrawerOpen && <button aria-label="Close navigation" onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[360px] flex-col rounded-r-[2rem] border-r border-white/10 bg-[#101011] px-4 py-5 shadow-2xl transition-transform duration-300 lg:relative lg:z-0 lg:flex lg:w-[280px] lg:translate-x-0 lg:rounded-none lg:bg-[#0a0a0b] lg:shadow-none ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2 pb-6">
          <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5c3a] to-[#00d4ff] p-px"><Image src="/kanglei-new-logo.png" alt="Kanglei AI" width={36} height={36} className="size-full rounded-[11px] object-cover" /></div><div><p className="text-sm font-semibold tracking-tight">Kanglei AI</p><p className="text-[11px] text-white/40">Intelligent. Responsive. Connected.</p></div></div>
          <button aria-label="Close menu" onClick={() => setIsDrawerOpen(false)} className="rounded-full p-2 text-white/50 hover:bg-white/10 lg:hidden"><X /></button>
        </div>
        <button onClick={handleNewChat} className="mb-5 flex h-11 items-center gap-3 rounded-2xl bg-white px-4 text-sm font-semibold text-black transition-transform hover:scale-[1.01] active:scale-[.98]"><Plus data-icon="inline-start" /> New Chat</button>
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {[['Chat', Sparkles], ['Images', ImageIcon], ['Library', Library], ['Projects', FolderKanban], ['Scheduled', CalendarClock], ['Explore', Compass]].map(([label, Icon]) => <button key={label as string} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${label === 'Chat' ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}><Icon className="size-[18px]" />{label as string}</button>)}
        </nav>
        <div className="mt-8 flex-1 overflow-y-auto"><p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/30">Recents</p>{chatHistory.slice(0, 8).map((chat) => <button key={chat.id} onClick={() => { window.location.href = `/chat/${chat.id}` }} className="block w-full truncate rounded-xl px-3 py-2.5 text-left text-xs text-white/55 hover:bg-white/5 hover:text-white">{chat.title}</button>)}</div>
        <div className="border-t border-white/10 pt-4"><button onClick={() => { window.location.href = '/settings' }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/5 hover:text-white"><Settings className="size-[18px]" /> Settings</button><button onClick={() => { window.location.href = '/settings' }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/5 hover:text-white"><UserRound className="size-[18px]" /> Profile</button></div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-7"><button aria-label="Open menu" onClick={() => setIsDrawerOpen(true)} className="rounded-full p-2.5 text-white/70 hover:bg-white/10 lg:hidden"><Menu /></button><div className="flex items-center gap-2 lg:hidden"><span className="text-sm font-semibold">KAI</span></div><button aria-label="Voice conversation" onClick={isListening ? stopVoiceInput : startVoiceInput} className={`rounded-full p-2.5 transition-colors ${isListening ? 'bg-red-500/20 text-red-300' : 'text-white/60 hover:bg-white/10'}`}><Volume2 /></button></header>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 sm:px-8">
          {messages.length === 0 ? <div className="m-auto flex w-full max-w-2xl flex-col items-center gap-8 pb-20 pt-8 text-center"><div className="relative"><div className="absolute inset-0 rounded-full bg-[#00d4ff]/10 blur-3xl" /><div className="relative flex size-24 items-center justify-center rounded-[2rem] border border-white/10 bg-[#18191b] p-2 shadow-[0_0_60px_rgba(0,212,255,.1)]"><Image src="/kanglei-new-logo.png" alt="Kanglei AI" width={96} height={96} className="size-full rounded-[1.4rem] object-cover" /></div></div><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">How can KAI help?</h1><p className="mt-3 text-sm text-white/40">Intelligent assistance, rooted in Manipur and built for everywhere.</p></div><div className="grid w-full gap-3 sm:grid-cols-3">{[['Write or edit', 'Draft, refine, and create', Sparkles], ['Search the web', 'Find current information', Globe2], ['Analyze files', 'Understand your documents', FileText]].map(([title, copy, Icon]) => <button key={title as string} onClick={() => setInput(title as string)} className="group rounded-2xl border border-white/10 bg-[#141415] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#1b1b1d]"><Icon className="mb-7 size-5 text-[#00d4ff]" /><p className="text-sm font-medium">{title as string}</p><p className="mt-1 text-xs text-white/35">{copy as string}</p></button>)}</div></div> : <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-6">{messages.map((msg, idx) => <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className="mt-1 size-7 shrink-0 overflow-hidden rounded-lg border border-[#1a5c3a]"><Image src="/kanglei-new-logo.png" alt="KAI" width={28} height={28} className="size-full object-cover" /></div>}<div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${msg.role === 'user' ? 'rounded-br-md bg-[#242426]' : 'text-white/85'}`}>{msg.content.startsWith('[IMAGE_URL:') ? <img src={msg.content.replace('[IMAGE_URL:', '').replace(']', '')} alt="Generated image" className="max-w-full rounded-xl" /> : msg.content}</div></div>)}{loading && <div className="flex items-center gap-2 text-sm text-white/40"><span className="size-2 animate-pulse rounded-full bg-[#00d4ff]" /><span className="size-2 animate-pulse rounded-full bg-[#00d4ff] [animation-delay:150ms]" /><span className="size-2 animate-pulse rounded-full bg-[#00d4ff] [animation-delay:300ms]" /></div>}<div ref={messagesEndRef} /></div>}
        </div>
        <div ref={inputAreaRef} className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-3 pt-2 sm:px-8 sm:pb-7"><div className="mb-3 flex gap-2 overflow-x-auto px-1">{['Write or edit', 'Search the web', 'Analyze files'].map((action) => <button key={action} onClick={() => setInput(action)} className="shrink-0 rounded-full border border-white/10 bg-white/[.04] px-3.5 py-2 text-xs text-white/60 transition hover:border-white/20 hover:text-white">{action}</button>)}</div><div className="flex items-center gap-2 rounded-[1.5rem] border border-white/10 bg-[#1c1c1e] p-2 shadow-2xl shadow-black/30 focus-within:border-white/20"><button aria-label="Attach file" className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"><Paperclip className="size-5" /></button><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.nativeEvent.isComposing || e.keyCode === 229) return; if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }} placeholder="Ask Kanglei AI" disabled={loading} className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/35" /><button aria-label="Voice input" onClick={isListening ? stopVoiceInput : startVoiceInput} className={`rounded-full p-2 ${isListening ? 'text-red-300' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}><Mic className="size-5" /></button><button aria-label="Send message" onClick={handleSendMessage} disabled={loading || !input.trim()} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#007aff] text-white transition hover:bg-[#1685ff] disabled:opacity-30"><ArrowUp className="size-5" /></button></div><p className="mt-2 text-center text-[10px] text-white/25">Kanglei AI can make mistakes. Check important information.</p></div>
      </main>
    </div>
  )
}
