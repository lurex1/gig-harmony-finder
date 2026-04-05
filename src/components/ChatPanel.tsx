import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, MessageSquare, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import type { Conversation, ChatMessage } from '@/hooks/useChat'

interface Props {
  role: 'musician' | 'venue'
  conversations: Conversation[]
  convLoading: boolean
  activeConvId: string | null
  messages: ChatMessage[]
  msgLoading: boolean
  onSelectConv: (id: string) => void
  onSend: (content: string) => Promise<void>
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export function ChatPanel({
  role,
  conversations,
  convLoading,
  activeConvId,
  messages,
  msgLoading,
  onSelectConv,
  onSend,
}: Props) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeConv = conversations.find(c => c.id === activeConvId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    await onSend(input.trim())
    setInput('')
    setSending(false)
  }

  const handleSelectConv = (id: string) => {
    onSelectConv(id)
    setMobileShowChat(true)
  }

  if (convLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{t('chat.loading')}</span>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-foreground mb-1">{t('chat.noConversationsTitle')}</p>
        <p className="text-sm">
          {role === 'musician'
            ? t('chat.noConversationsDescMusician')
            : t('chat.noConversationsDescVenue')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-[600px] rounded-xl border border-border overflow-hidden">
      {/* Conversation list */}
      <div
        className={`w-full sm:w-64 shrink-0 border-r border-border flex flex-col ${
          mobileShowChat ? 'hidden sm:flex' : 'flex'
        }`}
      >
        <div className="p-3 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('chat.conversations')}
          </p>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleSelectConv(conv.id)}
              className={`w-full text-left px-3 py-3 border-b border-border/50 hover:bg-secondary transition-colors ${
                conv.id === activeConvId ? 'bg-secondary' : ''
              }`}
            >
              <div className="font-medium text-sm text-foreground truncate">
                {conv.other_party_name}
              </div>
              {conv.last_message && (
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.last_message}
                </div>
              )}
              <div className="text-xs text-muted-foreground/60 mt-0.5">
                {formatDate(conv.created_at)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col ${
          !mobileShowChat && !activeConvId ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <button
            className="sm:hidden p-1 hover:bg-secondary rounded"
            onClick={() => setMobileShowChat(false)}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {activeConv ? (
            <span className="font-medium text-sm text-foreground">{activeConv.other_party_name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">{t('chat.selectConversation')}</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!activeConvId && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {t('chat.selectFromList')}
            </div>
          )}

          {activeConvId && msgLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {activeConvId && !msgLoading && messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              {t('chat.startMessage')}
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map(msg => {
              const isMine = msg.sender_id === user?.id
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMine
                        ? 'bg-foreground text-background rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-background/60' : 'text-muted-foreground'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {activeConvId && (
          <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" size="icon" variant="default" disabled={!input.trim() || sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
