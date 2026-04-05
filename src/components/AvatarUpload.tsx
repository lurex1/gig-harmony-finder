import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'

interface Props {
  userId: string
  currentUrl: string | null
  displayName: string
  size?: 'md' | 'lg'
  onUploaded: (url: string) => void
}

export function AvatarUpload({ userId, currentUrl, displayName, size = 'md', onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const avatarSize = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'
  const iconSize   = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  const textSize   = size === 'lg' ? 'text-2xl' : 'text-lg'

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadErr) {
      console.error('Avatar upload error:', uploadErr)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = data.publicUrl

    // Persist to musician_profiles
    await supabase
      .from('musician_profiles')
      .upsert({ user_id: userId, avatar_url: publicUrl }, { onConflict: 'user_id' })

    setPreview(publicUrl)
    setUploading(false)
    onUploaded(publicUrl)
  }

  return (
    <div className="relative group inline-block">
      <Avatar className={`${avatarSize} ring-2 ring-border`}>
        {preview ? (
          <AvatarImage src={preview} alt={displayName} className="object-cover" />
        ) : null}
        <AvatarFallback className={`bg-secondary text-foreground font-semibold ${textSize}`}>
          {initials || '?'}
        </AvatarFallback>
      </Avatar>

      {/* Overlay on hover */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="
          absolute inset-0 rounded-full flex items-center justify-center
          bg-black/50 opacity-0 group-hover:opacity-100
          transition-opacity cursor-pointer
        "
        title="Zmień zdjęcie"
      >
        {uploading
          ? <Loader2 className={`${iconSize} animate-spin text-white`} />
          : <Camera className={`${iconSize} text-white`} />
        }
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
