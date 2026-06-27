export interface CtaContent {
  title:      string
  subtitle:   string
  buttonText: string
}

export default function CtaSection({ content }: { content: CtaContent }) {
  return (
    <section className="section-gap bg-brand">
      <div className="container-nissi text-center reveal">
        <h2 className="font-headline font-bold text-black text-6xl lg:text-7xl leading-none mb-8">
          {content.title}
        </h2>
        <p className="font-body text-black/70 text-xl mb-12 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
        <a
          href="#contact"
          className="inline-block bg-black text-white font-body font-bold uppercase tracking-label px-12 py-5 hover:bg-surface-container transition-colors"
        >
          {content.buttonText}
        </a>
      </div>
    </section>
  )
}
