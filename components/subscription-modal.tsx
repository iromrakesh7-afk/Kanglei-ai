'use client'

import { useEffect, useState } from 'react'
import { getSubscriptionPlans } from '@/app/actions/subscriptions'
import { X, Check } from 'lucide-react'

interface SubscriptionModalProps {
  modelId: string
  modelName: string
  onClose: () => void
}

export function SubscriptionModal({ modelId, modelName, onClose }: SubscriptionModalProps) {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getSubscriptionPlans()
        setPlans(data)
      } catch (error) {
        console.error('[v0] Error fetching plans:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const requiredPlan = modelId === 'kanglei-ultra' ? 'kanglei-ultra' : 'kanglei-pro'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-green-500/30 rounded-lg max-w-2xl w-full p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Unlock {modelName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <p className="text-gray-400 mb-8">
          {modelName} is a premium AI model. Subscribe to get access to advanced features and faster responses.
        </p>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {plans.map((plan) => {
              // Determine plan compatibility based on model
              let canAccess = false
              let isPerfect = false
              
              if (modelId === 'kanglei-pro') {
                // Kanglei Pro requires Kanglei Pro, Ultra, or Premium
                canAccess = ['kanglei-pro', 'kanglei-ultra', 'kanglei-premium'].includes(plan.id)
                isPerfect = plan.id === 'kanglei-pro'
              } else if (modelId === 'kanglei-ultra') {
                // Kanglei Ultra requires Ultra or Premium
                canAccess = ['kanglei-ultra', 'kanglei-premium'].includes(plan.id)
                isPerfect = plan.id === 'kanglei-ultra'
              }
              
              return (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-6 transition-all ${
                    canAccess
                      ? isPerfect
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-green-500/50 bg-white/5 hover:border-green-500 hover:bg-green-500/5'
                      : 'border-gray-600 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                      <p className="text-xs text-gray-400">{plan.description}</p>
                    </div>
                    {isPerfect && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/50 whitespace-nowrap text-xs">
                        Best Match
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white">
                      ₹{plan.price_inr}
                      <span className="text-sm text-gray-400 block">
                        for {plan.duration_days ? `${plan.duration_days} days` : '1 month'}
                      </span>
                    </div>
                  </div>

                  {plan.features && Array.isArray(plan.features) && (
                    <ul className="space-y-2 mb-6 text-xs">
                      {plan.features.slice(0, 4).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-300">
                          <Check size={14} className="text-green-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-gray-500 text-xs">+ {plan.features.length - 4} more features</li>
                      )}
                    </ul>
                  )}

                  {canAccess && (
                    <button
                      className="w-full py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors text-sm"
                    >
                      Subscribe Now
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            💡 Contact the support team or admin for payment details and subscription activation.
          </p>
        </div>
      </div>
    </div>
  )
}
