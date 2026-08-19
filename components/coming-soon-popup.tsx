'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface ComingSoonPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function ComingSoonPopup({ isOpen, onClose }: ComingSoonPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-80 p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-400 flex items-center justify-center bg-white">
            <Image
              src="/kanglei-logo.png"
              alt="Kanglei AI Logo"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Meiteilon Kanglei</h2>
          <p className="text-gray-600 text-sm mb-4">
            This AI model will be available soon. We're preparing an amazing experience for you with Meiteilon language support.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  )
}
