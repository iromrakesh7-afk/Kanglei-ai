'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSubscriptionPlans, updateSubscriptionPlan, updateAdminPaymentSettings, getAdminSettings, isAdmin } from '@/app/actions/subscriptions'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [paymentQRCode, setPaymentQRCode] = useState('')
  const [paymentDetails, setPaymentDetails] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const ADMIN_PASSWORD = 'vince9863'
    
    if (adminPassword === ADMIN_PASSWORD) {
      setShowPasswordPrompt(false)
      setPasswordError('')
      // Now load admin data
      loadAdminData()
    } else {
      setPasswordError('Incorrect password')
      setAdminPassword('')
    }
  }

  const loadAdminData = async () => {
    try {
      const response = await fetch('/api/user')
      if (!response.ok) {
        router.push('/sign-in')
        return
      }
      const data = await response.json()
      setUserEmail(data.user?.email || '')

      const adminCheck = await isAdmin(data.user?.email)
      if (!adminCheck) {
        router.push('/')
        return
      }

      setIsAdminUser(true)

      // Fetch plans and settings
      const plansData = await getSubscriptionPlans()
      setPlans(plansData)

      const settingsData = await getAdminSettings()
      setSettings(settingsData)

      // Load payment details from settings
      const qrSetting = settingsData.find((s: any) => s.setting_key === 'payment_qr_code')
      const detailsSetting = settingsData.find((s: any) => s.setting_key === 'payment_details')
        
      if (qrSetting) setPaymentQRCode(qrSetting.setting_value)
      if (detailsSetting) setPaymentDetails(detailsSetting.setting_value)
    } catch (error) {
      console.error('[v0] Error loading admin data:', error)
      router.push('/sign-in')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePricing = async () => {
    if (!editingPlan) return

    setSaving(true)
    try {
      await updateSubscriptionPlan(
        editingPlan.id, 
        parseFloat(editingPlan.price_inr),
        editingPlan.duration_days || 30
      )
      
      // Refresh plans
      const plansData = await getSubscriptionPlans()
      setPlans(plansData)
      
      setEditingPlan(null)
      alert('Pricing and duration updated successfully!')
    } catch (error) {
      console.error('[v0] Error saving pricing:', error)
      alert('Error updating pricing')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePaymentSettings = async () => {
    setSaving(true)
    try {
      if (paymentQRCode) {
        await updateAdminPaymentSettings('payment_qr_code', paymentQRCode)
      }
      if (paymentDetails) {
        await updateAdminPaymentSettings('payment_details', paymentDetails)
      }
      
      alert('Payment settings updated successfully!')
    } catch (error) {
      console.error('[v0] Error saving settings:', error)
      alert('Error updating settings')
    } finally {
      setSaving(false)
    }
  }

  if (showPasswordPrompt) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950" style={{
        background: 'linear-gradient(180deg, #000000 0%, #080a18 40%, #12162D 100%)'
      }}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 max-w-sm w-full mx-3">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Enter password to continue</p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value)
                  setPasswordError('')
                }}
                placeholder="Enter admin password"
                className="w-full mt-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
              />
              {passwordError && (
                <p className="text-red-400 text-xs mt-2">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-all"
            >
              Verify Password
            </button>
          </form>

          <Link href="/" className="block text-center text-gray-400 hover:text-gray-300 text-sm mt-4 transition-colors">
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-slate-900">
        <div className="animate-spin inline-block w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!isAdminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-slate-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">Access Denied: Admin only</p>
          <Link href="/" className="text-green-400 hover:text-green-300">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <span className="text-sm text-gray-400">({userEmail})</span>
        </div>

        {/* Subscription Plans Section */}
        <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
          
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-green-500/20 rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>

                {editingPlan?.id === plan.id ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">₹</span>
                      <input
                        type="number"
                        value={editingPlan.price_inr}
                        onChange={(e) => setEditingPlan({ ...editingPlan, price_inr: e.target.value })}
                        className="w-20 px-3 py-2 bg-slate-700 border border-green-500/30 rounded text-white text-sm"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">for</span>
                      <input
                        type="number"
                        value={editingPlan.duration_days || 30}
                        onChange={(e) => setEditingPlan({ ...editingPlan, duration_days: parseInt(e.target.value) })}
                        className="w-16 px-3 py-2 bg-slate-700 border border-green-500/30 rounded text-white text-sm"
                        min="1"
                      />
                      <span className="text-gray-400 text-sm">days</span>
                    </div>
                    <button
                      onClick={handleSavePricing}
                      disabled={saving}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded transition-colors disabled:opacity-50 text-sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingPlan(null)}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-lg font-bold">₹{plan.price_inr}</span>
                      <p className="text-xs text-gray-400">for {plan.duration_days || 30} days</p>
                    </div>
                    <button
                      onClick={() => setEditingPlan({ ...plan, duration_days: plan.duration_days || 30 })}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-sm"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Settings Section */}
        <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Payment Settings</h2>

          <div className="space-y-6">
            {/* Payment QR Code */}
            <div>
              <label className="block text-sm font-semibold mb-2">Payment QR Code (URL)</label>
              <textarea
                value={paymentQRCode}
                onChange={(e) => setPaymentQRCode(e.target.value)}
                placeholder="Paste QR code image URL or UPI deep link"
                className="w-full px-4 py-3 bg-slate-700 border border-green-500/30 rounded text-white placeholder-gray-500 focus:border-green-500 outline-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-2">You can use UPI links like: upi://pay?pa=your_upi@bank&pn=Name&tn=KangleiAI</p>
            </div>

            {/* Payment Details */}
            <div>
              <label className="block text-sm font-semibold mb-2">Payment Details</label>
              <textarea
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                placeholder="Enter payment methods (Bank details, Crypto address, etc.)"
                className="w-full px-4 py-3 bg-slate-700 border border-green-500/30 rounded text-white placeholder-gray-500 focus:border-green-500 outline-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">Format: method name, account details, etc.</p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSavePaymentSettings}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
