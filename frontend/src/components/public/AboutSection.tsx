export interface AboutContent {
  label:       string
  title:       string
  description1: string
  description2: string
  stat1_number: string
  stat1_label:  string
  stat2_number: string
  stat2_label:  string
  stat3_number: string
  stat3_label:  string
  stat4_number: string
  stat4_label:  string
}

export default function AboutSection({ content }: { content: AboutContent }) {
  const stats = [
    { number: content.stat1_number, label: content.stat1_label },
    { number: content.stat2_number, label: content.stat2_label },
    { number: content.stat3_number, label: content.stat3_label },
    { number: content.stat4_number, label: content.stat4_label },
  ]

  return (
    <section id="about" className="section-gap bg-surface-container border-t border-white/10">
      <div className="container-nissi grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="reveal">
          <p className="label mb-6">{content.label}</p>
          <h2 className="headline-lg text-white mb-8">{content.title}</h2>
          <div className="w-20 h-0.5 bg-brand mb-8"></div>
          <p className="font-body text-on-surface-muted text-lg leading-relaxed mb-6">
            {content.description1}
          </p>
          <p className="font-body text-on-surface-muted text-lg leading-relaxed">
            {content.description2}
          </p>
        </div>
        <div className="reveal reveal-delay-2 grid grid-cols-2 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="card p-8 bg-surface">
              <div className="font-headline font-bold text-brand text-4xl mb-2">{stat.number}</div>
              <div className="label text-on-surface-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
