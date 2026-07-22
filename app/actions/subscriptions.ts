'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getSubscriptionPlans() {
  try {
    const result = await db.raw(
      sql`SELECT * FROM subscription_plans ORDER BY price_inr ASC`
    )
    // db.raw returns an array directly with Drizzle
    const plans = Array.isArray(result) ? result : []
    return plans
  } catch (error) {
    console.error('[v0] Error fetching subscription plans:', error)
    return []
  }
}

export async function getUserSubscription() {
  try {
    const userId = await getUserId()
    const result = await db.raw(
      sql`SELECT us.*, sp.name, sp.price_inr, sp.duration_days FROM user_subscriptions us 
          LEFT JOIN subscription_plans sp ON us.planId = sp.id 
          WHERE us.userId = ${userId} 
          ORDER BY us.created_at DESC LIMIT 1`
    )
    // db.raw returns an array directly with Drizzle
    const subscription = (Array.isArray(result) ? result[0] : null) || null
    
    // Check if subscription has expired
    if (subscription && subscription.expires_at) {
      const now = new Date()
      const expiresAt = new Date(subscription.expires_at)
      if (now > expiresAt) {
        return null // Subscription expired
      }
    }
    
    return subscription
  } catch (error) {
    console.error('[v0] Error fetching user subscription:', error)
    return null
  }
}

export async function hasAccessToPremiumModel(modelId: string) {
  try {
    const userId = await getUserId()
    
    // Free model
    if (modelId === 'kanglei-lite') {
      return true
    }

    // Check subscription for premium models
    if (modelId === 'kanglei-pro' || modelId === 'kanglei-ultra') {
      const subscription = await getUserSubscription()
      if (!subscription) return false
      
      // Ultra model requires Ultra subscription
      if (modelId === 'kanglei-ultra' && subscription.planId !== 'kanglei-ultra') {
        return false
      }
      
      return true
    }

    return false
  } catch (error) {
    console.error('[v0] Error checking premium access:', error)
    return false
  }
}

export async function getAdminSettings() {
  try {
    const result = await db.raw(
      sql`SELECT * FROM admin_settings WHERE admin_email = 'iromrakesh7@gmail.com'`
    )
    // db.raw returns an array directly with Drizzle
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error('[v0] Error fetching admin settings:', error)
    return []
  }
}

export async function isAdmin(email: string) {
  return email === 'iromrakesh7@gmail.com'
}

export async function updateSubscriptionPlan(planId: string, priceInr: number, durationDays: number = 30) {
  try {
    const email = 'iromrakesh7@gmail.com'
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user || session.user.email !== email) {
      throw new Error('Unauthorized: Only admin can update plans')
    }

    await db.raw(
      sql`UPDATE subscription_plans SET price_inr = ${priceInr}, duration_days = ${durationDays}, updated_at = NOW() WHERE id = ${planId}`
    )
    
    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating subscription plan:', error)
    throw error
  }
}

export async function updateAdminPaymentSettings(settingKey: string, settingValue: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user || session.user.email !== 'iromrakesh7@gmail.com') {
      throw new Error('Unauthorized: Only admin can update settings')
    }

    await db.raw(
      sql`INSERT INTO admin_settings (id, admin_email, setting_key, setting_value, created_at, updated_at) 
          VALUES (gen_random_uuid()::text, 'iromrakesh7@gmail.com', ${settingKey}, ${settingValue}, NOW(), NOW())
          ON CONFLICT (admin_email) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`
    )
    
    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating admin settings:', error)
    throw error
  }
}
