interface Service {
  id:          string
  icon?:       string
  title:       string
  description: string
}

interface Props {
  services: Service[]
}

export default function ServicesSection({ services }: Props) {
  if (!services.length) return null

  return (
    <section id="services" data-nav-theme="light" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8 md:px-16">

        <h2 className="reveal text-[#FF8000] text-3xl md:text-4xl font-extrabold text-center tracking-tight mb-16">
          Ce que nous faisons
        </h2>

        <div className="flex flex-wrap justify-center gap-12">
          {services.map((service, i) => (
            <div key={service.id} className={`reveal reveal-delay-${Math.min(i + 1, 4)} service-card flex flex-col gap-4 p-6 border border-gray-100 w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)]`}>
              <div className="flex items-center gap-4">
                {service.icon && (
                  <span
                    className="material-symbols-outlined text-[#121414] flex-shrink-0"
                    style={{ fontSize: '2rem' }}
                  >
                    {service.icon}
                  </span>
                )}
                <h3 className="text-2xl font-bold text-[#121414]">{service.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">{service.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
