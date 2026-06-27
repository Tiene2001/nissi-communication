import SmokeVideo from './SmokeVideo'

export interface HeroContent {
  title:        string
  description:  string
  tagline:      string
  stat1_number: string
  stat1_label:  string
  stat2_number: string
  stat2_label:  string
  stat3_number: string
  stat3_label:  string
  stat4_number: string
  stat4_label:  string
}

export default function HeroSection({ content }: { content: HeroContent }) {
  const stats = [
    { number: content.stat1_number, label: content.stat1_label },
    { number: content.stat2_number, label: content.stat2_label },
    { number: content.stat3_number, label: content.stat3_label },
    { number: content.stat4_number, label: content.stat4_label },
  ].filter(s => s.number || s.label)

  return (
    <>
      <main id="hero" className="flex-grow flex flex-col relative">
        <img
          src="/images/hero-bg.png"
          alt="Trône mystique NISSI Communication"
          className="w-full h-[100vh] object-cover"
        />
        <img
          src="/images/dots-pattern.png"
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-auto object-cover opacity-40 mix-blend-screen pointer-events-none"
        />
        <SmokeVideo />

        {/* Indicateur de scroll */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none scroll-bounce">
          <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.4em]">Défiler</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </main>

      <section id="about" className="bg-[#121414] px-8 md:px-20 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/3">
            <h1 className="text-[#FF8000] text-4xl md:text-6xl font-bold tracking-tight font-sans leading-none">
              {content.title}
            </h1>
            <img
              src="/images/separator.png"
              alt=""
              aria-hidden="true"
              className="w-full mt-2 object-contain"
            />
          </div>
          <div className="md:w-1/2 space-y-3">
            <p className="text-white text-base leading-relaxed font-medium">
              {content.description}
            </p>
            <p className="text-[#FF8000] font-bold italic text-base">
              {content.tagline}
            </p>
          </div>
        </div>

        {/* Stats — affichées seulement si au moins une est renseignée */}
        {stats.length > 0 && (
          <div className="max-w-7xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="border border-white/10 px-6 py-5">
                <div className="text-[#FF8000] font-bold text-3xl md:text-4xl font-sans leading-none mb-1">
                  {stat.number}
                </div>
                <div className="text-white/50 text-xs uppercase tracking-widest font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
