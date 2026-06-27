const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function resolveUrl(url: string) {
  if (!url) return url
  return url.startsWith('/') ? `${API}${url}` : url
}

interface Client {
  id: string
  name: string
  logo: string
}

interface Props {
  clients: Client[]
}

export default function ClientsSection({ clients }: Props) {
  if (clients.length === 0) return null

  return (
    <section id="clients" className="bg-[#121414] py-20 px-8 md:px-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="reveal text-[#FF8000] text-3xl font-bold text-center tracking-tight mb-16">
          Nos précieux Fidèles
        </h2>
        <div className="reveal reveal-delay-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {clients.map(client => (
            <div key={client.id}>
              <img
                src={resolveUrl(client.logo)}
                alt={client.name}
                className="h-12 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
