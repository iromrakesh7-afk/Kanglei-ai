'use client'

import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getApps, initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.apiKey,
  authDomain: 'kanglei-ai-31b3c.firebaseapp.com',
  projectId: 'kanglei-ai-31b3c',
  storageBucket: 'kanglei-ai-31b3c.firebasestorage.app',
  messagingSenderId: '1032138066517',
  appId: '1:1032138066517:web:d8a7abdd0d3c8cbcf0e2dc',
  measurementId: 'G-NY04DWX1CX',
}

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (!firebaseConfig.apiKey || !(await isSupported())) return null
  return getAnalytics(firebaseApp)
}
