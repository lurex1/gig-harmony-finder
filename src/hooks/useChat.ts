import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  musician_id: string
  venue_id: string
  created_at: string
  other_party_name: string
  last_message?: string
}

export function useChat(role: 'musician' | 'venue') {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [convLoading, setConvLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Load conversations for current user
  const loadConversations = useCallback(async () => {
    if (!user) return
    setConvLoading(true)

    const col = role === 'musician' ? 'musician_id' : 'venue_id'
    const otherCol = role === 'musician' ? 'venue_id' : 'musician_id'

    const { data: convs, error } = await supabase
      .from('conversations')
      .select('*')
      .eq(col, user.id)
      .order('created_at', { ascending: false })

    if (error || !convs) { setConvLoading(false); return }

    // Fetch names of other parties
    const otherIds = convs.map(c => c[otherCol as keyof typeof c] as string)
    const { data: profileNames } = await supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', otherIds)

    const nameMap: Record<string, string> = {}
    profileNames?.forEach(p => { nameMap[p.user_id] = p.name })

    // Fetch last message for each conversation
    const lastMsgMap: Record<string, string> = {}
    if (convs.length > 0) {
      for (const conv of convs) {
        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (lastMsg) lastMsgMap[conv.id] = lastMsg.content
      }
    }

    const enriched: Conversation[] = convs.map(c => ({
      id: c.id,
      musician_id: c.musician_id,
      venue_id: c.venue_id,
      created_at: c.created_at,
      other_party_name: nameMap[c[otherCol as keyof typeof c] as string] ?? 'Użytkownik',
      last_message: lastMsgMap[c.id],
    }))

    setConversations(enriched)
    setConvLoading(false)
  }, [user, role])

  useEffect(() => { loadConversations() }, [loadConversations])

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return }

    setMsgLoading(true)

    supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', activeConvId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? [])
        setMsgLoading(false)
      })

    // Subscribe to real-time new messages
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`chat:${activeConvId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage])
          // Update last message in conversation list
          setConversations(prev =>
            prev.map(c =>
              c.id === activeConvId
                ? { ...c, last_message: (payload.new as ChatMessage).content }
                : c
            )
          )
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [activeConvId])

  // Subscribe to new conversations in real-time
  useEffect(() => {
    if (!user) return

    const col = role === 'musician' ? 'musician_id' : 'venue_id'

    const channel = supabase
      .channel(`conversations:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `${col}=eq.${user.id}`,
        },
        () => { loadConversations() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, role, loadConversations])

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !activeConvId || !content.trim()) return

    await supabase.from('chat_messages').insert({
      conversation_id: activeConvId,
      sender_id: user.id,
      content: content.trim(),
    })
  }, [user, activeConvId])

  // Create or open a conversation with another user
  const openConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!user) return null

    const musician_id = role === 'musician' ? user.id : otherUserId
    const venue_id = role === 'venue' ? user.id : otherUserId

    // Upsert conversation (idempotent)
    const { data, error } = await supabase
      .from('conversations')
      .upsert({ musician_id, venue_id }, { onConflict: 'musician_id,venue_id' })
      .select('id')
      .single()

    if (error || !data) return null

    await loadConversations()
    setActiveConvId(data.id)
    return data.id
  }, [user, role, loadConversations])

  return {
    conversations,
    convLoading,
    activeConvId,
    setActiveConvId,
    messages,
    msgLoading,
    sendMessage,
    openConversation,
    refreshConversations: loadConversations,
  }
}
