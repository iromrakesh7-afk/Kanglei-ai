'use client'

import { useState } from 'react'
import { X, Upload, Lock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'privacy'>('profile')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [phone, setPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetStep, setResetStep] = useState<'phone' | 'password'>('phone')
  const [showPrivacy, setShowPrivacy] = useState(false)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatar(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResetPassword = async () => {
    if (resetStep === 'phone') {
      // Verify phone and move to password step
      if (phone.length < 10) {
        alert('Please enter a valid phone number')
        return
      }
      setResetStep('password')
    } else {
      // Save new password
      if (newPassword !== confirmPassword) {
        alert('Passwords do not match')
        return
      }
      if (newPassword.length < 8) {
        alert('Password must be at least 8 characters')
        return
      }
      // Here you would call an API to save the new password
      alert('Password updated successfully! You can now login with your new password.')
      setResetStep('phone')
      setPhone('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-slate-900 rounded-lg shadow-lg w-full max-w-sm md:max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-green-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-green-500/30">
          <h2 className="text-base md:text-lg font-bold text-white">Account Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-green-400"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-green-500/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'text-green-400 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-green-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'password'
                ? 'text-green-400 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-green-300'
            }`}
          >
            Reset Password
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'text-green-400 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-green-300'
            }`}
          >
            Privacy
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-3 md:space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-2 md:gap-4">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-green-500 overflow-hidden bg-slate-800 flex items-center justify-center">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-xs md:text-sm">No image</div>
                  )}
                </div>
                <label className="flex items-center gap-1 md:gap-2 cursor-pointer text-green-400 hover:text-green-300">
                  <Upload className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm">Upload Avatar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="space-y-2 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-green-500/30 rounded-lg bg-slate-800 text-gray-300 text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-green-500/30 rounded-lg bg-slate-800 text-gray-300 text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reset Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-2 md:space-y-4">
              {resetStep === 'phone' ? (
                <>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                      Enter Phone Number
                    </label>
                    <p className="text-xs text-gray-400 mb-2 md:mb-3">
                      We'll verify your phone number to reset your password.
                    </p>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-green-500/50 rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-xs md:text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleResetPassword}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-medium text-xs md:text-sm"
                  >
                    Verify Phone Number
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-green-500/50 rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-xs md:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-green-500/50 rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-xs md:text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleResetPassword}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-medium text-xs md:text-sm"
                  >
                    Save New Password
                  </Button>
                  <Button
                    onClick={() => {
                      setResetStep('phone')
                      setPhone('')
                    }}
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-green-400 text-xs md:text-sm"
                  >
                    Back
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-2 md:space-y-4">
              <button
                onClick={() => setShowPrivacy(!showPrivacy)}
                className="w-full flex items-center gap-2 px-2 md:px-4 py-2 md:py-3 border border-green-500/30 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                <span className="flex-1 text-left font-medium text-white text-xs md:text-sm">
                  Privacy Policy
                </span>
                <span className="text-xl md:text-2xl text-gray-400">
                  {showPrivacy ? '−' : '+'}
                </span>
              </button>

              {showPrivacy && (
                <div className="mt-2 md:mt-4 p-2 md:p-4 bg-slate-800/50 rounded-lg border border-green-500/30">
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="font-bold text-white text-xs md:text-sm">Privacy Policy</h3>
                    <p className="text-xs text-gray-300">
                      Our Privacy Policy was last updated on <strong>27/06/26</strong>.
                    </p>
                    <p className="text-xs text-gray-400">
                      At <strong>Kanglei Ai</strong>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by <strong>Kanglei Ai</strong> and how we use it.
                    </p>
                    <p className="text-xs text-gray-400">
                      <strong>Contact:</strong> support@rakeshirom.in
                    </p>
                    <h4 className="font-semibold text-white mt-2 text-xs md:text-sm">Information We Collect</h4>
                    <p className="text-xs text-gray-400">
                      We collect personal information you provide directly to us, including name, email address, phone number, and any other information you choose to provide.
                    </p>
                    <h4 className="font-semibold text-white mt-2 text-xs md:text-sm">How We Use Your Information</h4>
                    <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                      <li>Provide, operate, and maintain our website</li>
                      <li>Improve and personalize your experience</li>
                      <li>Communicate with you about updates</li>
                      <li>Find and prevent fraud</li>
                    </ul>
                    <p className="text-xs mt-2 text-gray-500 italic">
                      For the complete privacy policy, please visit www.kangleiai.in
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
