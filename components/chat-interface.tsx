'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Send, ChevronDown, Loader2, Mic, ImageIcon, Menu } from 'lucide-react'
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
  { id: 'kanglei-lite', apiModel: 'groq/llama-3.3-70b-versatile', name: 'Kanglei Lite', provider: 'Kanglei', lang: 'en', disabled: false },
  { id: 'kanglei-pro', apiModel: 'groq/llama-3.3-70b-versatile', name: 'Kanglei Pro', provider: 'Kanglei', lang: 'en', disabled: false },
  { id: 'kanglei-ultra', apiModel: 'groq/llama-3.3-70b-versatile', name: 'Kanglei Ultra', provider: 'Kanglei', lang: 'en', disabled: false },
  { id: 'meiteilon-kanglei', apiModel: 'groq/llama-3.3-70b-versatile', name: 'Meiteilon Kanglei (Coming Soon)', provider: 'Kanglei', lang: 'meiteilon', disabled: true },
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
          model: selectedModelData?.apiModel || 'groq/llama-3.3-70b-versatile',
          language: selectedLanguage,
          useSearch: false,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
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
          content: 'Sorry, I encountered an error. Please try again.',
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
    <div className="flex flex-col h-screen w-full overflow-hidden">

      {/* Messages Area - Mobile Responsive */}
      <div className="flex-1 overflow-y-auto px-2 md:px-6 py-2 md:py-4 space-y-2 md:space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-6">
            <div className="flex flex-col items-center gap-2 md:gap-4">
              <div className="w-16 h-16 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-green-500 flex items-center justify-center bg-slate-900 flex-shrink-0">
                <Image
                  src="/kanglei-logo.png"
                  alt="Kanglei AI Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-1">Kanglei AI</h2>
                <p className="text-xs md:text-sm text-gray-400">Founded by Rakesh Irom</p>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'What is Kanglei AI?',
                'How can you help me?',
                'Tell me about Manipur',
                'Explain artificial intelligence',
              ].map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(question)
                    setTimeout(() => {
                      (document.activeElement as HTMLInputElement)?.blur()
                    }, 0)
                  }}
                  className="p-3 text-left rounded-lg border border-green-500/30 bg-slate-800/50 hover:bg-slate-800 text-gray-200 hover:text-white hover:border-green-500/60 transition-all text-xs md:text-sm font-medium"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 mt-1 hidden sm:block">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden flex items-center justify-center border-2 border-green-500 ${
                  isAnswering && idx === messages.length - 1 ? 'animate-spin' : ''
                }`}>
                  <Image
                    src="/kanglei-logo.png"
                    alt="Kanglei"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className={`flex flex-col gap-1 ${msg.role === 'assistant' ? 'w-full' : ''}`}>
              <div
                className={`px-2 md:px-4 py-1.5 md:py-3 rounded-lg text-xs md:text-base ${
                  msg.role === 'user'
                    ? 'max-w-xs sm:max-w-md md:max-w-2xl bg-green-500 text-black rounded-br-none font-medium'
                    : 'w-full bg-transparent text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.content.startsWith('[IMAGE_URL:') ? (
                  <div className="flex flex-col gap-2">
                    <img
                      src={msg.content.replace('[IMAGE_URL:', '').replace(']', '')}
                      alt="Generated image"
                      className="max-w-xs md:max-w-md rounded-lg"
                    />
                    <p className="text-xs text-gray-300">Image generated from prompt</p>
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === 'assistant' && (
                <p className="text-xs text-gray-500 ml-2">
                  {selectedModelData?.name || 'Kanglei AI'}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 md:gap-3 justify-start">
            <div className="flex-shrink-0 mt-1 hidden sm:block">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden flex items-center justify-center border-2 border-green-500 animate-spin">
                <Image
                  src="/kanglei-logo.png"
                  alt="Kanglei"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full bg-transparent text-gray-200 px-3 md:px-4 py-2 md:py-3 rounded-lg rounded-bl-none text-sm md:text-base">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Minimalist Input Area - Mobile Optimized */}
      <div ref={inputAreaRef} className="border-t border-green-500/20 bg-slate-950 px-2 lg:px-6 py-2 lg:py-3 flex-shrink-0 transition-all duration-200 flex flex-col gap-2 lg:gap-3">
        <div className="flex flex-col gap-2 lg:gap-3">
          {/* Input Container - Gemini Pro Style */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-2.5 transition-all hover:border-white/40">
            {/* Left: Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="p-1.5 hover:bg-green-500/30 rounded-lg transition-colors flex-shrink-0"
                title="Menu"
              >
                <Menu size={18} className="text-green-400" />
              </button>

              {showMenuDropdown && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-white/30 rounded-lg shadow-2xl z-50 min-w-max max-h-96 overflow-y-auto">
                  <button
                    onClick={() => {
                      handleNewChat()
                      setShowMenuDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-all border-b border-white/10"
                  >
                    New Chat
                  </button>

                  {/* Chat History in Menu */}
                  {chatHistory.length > 0 && (
                    <div className="py-2">
                      <div className="px-4 py-1 text-xs text-gray-600 uppercase">Recent</div>
                      {chatHistory.slice(0, 5).map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => {
                            window.location.href = `/chat/${chat.id}`
                          }}
                          className="block w-full text-left px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-all truncate"
                          title={chat.title}
                        >
                          {chat.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Admin Dashboard - Only for admin */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        window.location.href = '/admin'
                        setShowMenuDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20 transition-all border-t border-white/10"
                    >
                      Admin Dashboard
                    </button>
                  )}

                  {/* Settings in Menu */}
                  <button
                    onClick={() => {
                      window.location.href = '/settings'
                      setShowMenuDropdown(false)
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-all ${isAdmin ? '' : 'border-t border-white/10'}`}
                  >
                    Settings
                  </button>
                </div>
              )}
            </div>

            {/* AI Model Selector */}
            <div className="relative flex-shrink-0" ref={modelDropdownRef}>
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1 text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
              >
                <span className="truncate max-w-12">{selectedModelData?.name || 'K.AI'}</span>
                <ChevronDown 
                  size={12}
                  className={`transition-transform flex-shrink-0 ${showModelDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {showModelDropdown && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-white/30 rounded-lg shadow-2xl z-50 min-w-max">
                  {AVAILABLE_MODELS.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        if (!m.disabled) {
                          setSelectedModel(m.id)
                          setModelTransition(true)
                          setTimeout(() => setModelTransition(false), 300)
                        }
                        setShowModelDropdown(false)
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-all ${
                        m.disabled
                          ? 'bg-slate-800 text-gray-500 opacity-60'
                          : selectedModel === m.id
                          ? 'bg-green-500/30 text-green-400 font-semibold'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Left: Voice Input Button */}
            <button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={`p-1.5 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-white/70 hover:text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              <Mic size={18} />
            </button>

            {/* Center: Input Field with "Ask Kanglei" placeholder */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask Kanglei"
              disabled={loading}
              className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Right: Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 h-9 w-9 min-w-9 flex-shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              size="sm"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} style={{ transform: 'rotate(-45deg)' }} />
              )}
            </Button>
          </div>


        </div>
      </div>

      <p className="text-xs md:text-sm text-gray-500 text-center line-clamp-1 px-4 pb-2">
        Kanglei AI can make mistakes.
      </p>

      {/* Coming Soon Popup */}
      <ComingSoonPopup
        isOpen={showComingSoonPopup}
        onClose={() => setShowComingSoonPopup(false)}
      />


    </div>
  )
}
