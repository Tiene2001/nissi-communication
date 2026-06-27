'use client'
import { useState, useRef } from 'react'
import api from '@/lib/api'

interface Props {
  onUploaded: (url: string, type: 'IMAGE' | 'VIDEO') => void
}

export default function MediaUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<{ url: string; type: 'IMAGE' | 'VIDEO' } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED = 'image/jpeg,image/png,image/webp,video/mp4,video/webm'

  const handleFile = async (file: File) => {
    setError('')

    // Prévisualisation locale
    const localUrl = URL.createObjectURL(file)
    const isVideo = file.type.startsWith('video/')
    const mediaType = isVideo ? 'VIDEO' : 'IMAGE'
    setPreview({ url: localUrl, type: mediaType })

    // Upload
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/api/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total))
        },
      })
      onUploaded(res.data.url, mediaType)
      setPreview(null)
      setProgress(0)
    } catch {
      setError('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-white/20 hover:border-brand p-8 text-center cursor-pointer transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div>
            <p className="label mb-4">UPLOAD EN COURS...</p>
            <div className="w-full bg-surface-container h-1">
              <div
                className="bg-brand h-1 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-body text-on-surface-muted text-xs mt-2">{progress}%</p>
          </div>
        ) : preview ? (
          <div>
            {preview.type === 'VIDEO' ? (
              <video src={preview.url} className="w-full max-h-40 object-contain mx-auto" />
            ) : (
              <img src={preview.url} alt="Preview" className="max-h-40 mx-auto object-contain" />
            )}
            <p className="label mt-3">Prévisualisation — En cours d&apos;upload...</p>
          </div>
        ) : (
          <div>
            <p className="font-headline font-bold text-on-surface-muted text-2xl mb-2">+</p>
            <p className="label">AJOUTER UN FICHIER</p>
            <p className="font-body text-on-surface-muted text-xs mt-2">
              JPG, PNG, WEBP, MP4, WEBM · Glisser-déposer ou cliquer
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 font-body text-xs mt-2">{error}</p>}
    </div>
  )
}
