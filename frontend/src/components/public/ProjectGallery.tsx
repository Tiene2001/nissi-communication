'use client'
import { useState, useRef } from 'react'

interface Media {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO'
  order: number
}

interface Props {
  media: Media[]
  title: string
}

export default function ProjectGallery({ media, title }: Props) {
  const [lightboxItem, setLightboxItem] = useState<Media | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const items = media.filter(m => m.type === 'IMAGE' || m.type === 'VIDEO')

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -600 : 600, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <>
      <section className="py-32 bg-[#0a0a0a] overflow-hidden">
        <div className="px-6 mb-16">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white">
              Galerie <span className="text-[#FF8000]">Immersive</span>
            </h2>
            <div className="hidden md:flex gap-4">
              <button
                onClick={() => scroll('left')}
                className="rounded-full w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white"
                aria-label="Précédent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="rounded-full w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white"
                aria-label="Suivant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide px-[10vw] pb-24 snap-x"
        >
          {items.map((m, i) => (
            <div
              key={m.id}
              className="gallery-item relative flex-none w-[80vw] md:w-[600px] h-[400px] snap-center cursor-pointer"
              style={{ zIndex: i + 10 }}
              onClick={() => setLightboxItem(m)}
            >
              {m.type === 'VIDEO' ? (
                <>
                  <video
                    src={m.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover shadow-2xl"
                  />
                  {/* Badge VIDÉO */}
                  <div className="absolute top-4 left-4 bg-[#FF8000] text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 pointer-events-none">
                    Vidéo
                  </div>
                  {/* Icône play centrée */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '2.2rem' }}>play_arrow</span>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={m.url}
                  alt={`${title} - ${i + 1}`}
                  className="w-full h-full object-cover shadow-2xl"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxItem(null)}
        >
          <button
            className="absolute top-8 right-8 text-white/50 hover:text-white text-4xl font-light leading-none"
            onClick={() => setLightboxItem(null)}
            aria-label="Fermer"
          >
            ×
          </button>
          {lightboxItem.type === 'VIDEO' ? (
            <video
              src={lightboxItem.url}
              controls
              autoPlay
              className="max-w-[90%] max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightboxItem.url}
              alt="Image agrandie"
              className="max-w-[90%] max-h-[85vh] object-contain"
              onClick={e => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  )
}
