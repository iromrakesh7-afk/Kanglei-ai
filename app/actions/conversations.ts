'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { conversation, message } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createConversation(title: string = 'New Chat', model: string = 'groq/llama-3.3-70b-versatile') {
  const userId = await getUserId()
  const id = `conv-${Date.now()}`
  
  await db.insert(conversation).values({
    id,
    userId,
    title,
    model,
  })
  
  // Don't revalidate during initial page render to avoid errors
  try {
    revalidatePath('/chat')
  } catch (error) {
    console.warn('[v0] Could not revalidate path:', error)
  }
  
  return { id, title, model }
}

export async function getConversations() {
  const userId = await getUserId()
  return db
    .select()
    .from(conversation)
    .where(eq(conversation.userId, userId))
    .orderBy(desc(conversation.createdAt))
}

export async function getConversation(conversationId: string) {
  const userId = await getUserId()
  const conv = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)
  
  if (!conv || conv.length === 0 || conv[0].userId !== userId) {
    throw new Error('Conversation not found')
  }
  
  return conv[0]
}

export async function updateConversationTitle(conversationId: string, title: string) {
  const userId = await getUserId()
  const conv = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)
  
  if (!conv || conv.length === 0 || conv[0].userId !== userId) {
    throw new Error('Conversation not found')
  }
  
  await db.update(conversation).set({ title }).where(eq(conversation.id, conversationId))
  revalidatePath('/chat')
  revalidatePath(`/chat/${conversationId}`)
}

export async function deleteConversation(conversationId: string) {
  const userId = await getUserId()
  const conv = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)
  
  if (!conv || conv.length === 0 || conv[0].userId !== userId) {
    throw new Error('Conversation not found')
  }
  
  await db.delete(conversation).where(eq(conversation.id, conversationId))
  revalidatePath('/chat')
}

export async function getMessages(conversationId: string) {
  const userId = await getUserId()
  
  // Verify user owns this conversation
  const conv = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)
  
  if (!conv || conv.length === 0 || conv[0].userId !== userId) {
    throw new Error('Conversation not found')
  }
  
  return db
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(message.createdAt)
}

export async function addMessage(
  conversationId: string,
  role: string,
  content: string
) {
  const userId = await getUserId()
  
  // Verify user owns this conversation
  const conv = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)
  
  if (!conv || conv.length === 0 || conv[0].userId !== userId) {
    throw new Error('Conversation not found')
  }
  
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
  
  await db.insert(message).values({
    id,
    conversationId,
    userId,
    role,
    content,
  })
  
  revalidatePath(`/chat/${conversationId}`)
  return { id, role, content }
}
