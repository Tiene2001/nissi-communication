'use client'
import { useState, useEffect, useRef } from 'react'

const ICONS = [
  // Communication & Digital
  { name: 'language',            label: 'Web / Internet'     },
  { name: 'public',              label: 'Global'             },
  { name: 'wifi',                label: 'Wifi'               },
  { name: 'rss_feed',            label: 'Flux RSS'           },
  { name: 'cast',                label: 'Diffusion'          },
  { name: 'computer',            label: 'Ordinateur'         },
  { name: 'devices',             label: 'Appareils'          },
  { name: 'smartphone',          label: 'Mobile'             },
  { name: 'laptop',              label: 'Laptop'             },
  { name: 'cloud',               label: 'Cloud'              },
  { name: 'code',                label: 'Code'               },
  // Créatif & Design
  { name: 'palette',             label: 'Palette'            },
  { name: 'brush',               label: 'Pinceau'            },
  { name: 'edit',                label: 'Édition'            },
  { name: 'format_paint',        label: 'Peinture'           },
  { name: 'design_services',     label: 'Design'             },
  { name: 'style',               label: 'Style'              },
  { name: 'color_lens',          label: 'Couleurs'           },
  { name: 'draw',                label: 'Dessin'             },
  { name: 'auto_fix_high',       label: 'Retouche'           },
  { name: 'auto_awesome',        label: 'Créatif'            },
  // Média & Production
  { name: 'movie',               label: 'Film'               },
  { name: 'videocam',            label: 'Vidéo'              },
  { name: 'camera_alt',          label: 'Photo'              },
  { name: 'mic',                 label: 'Micro'              },
  { name: 'headphones',          label: 'Audio'              },
  { name: 'music_note',          label: 'Musique'            },
  { name: 'play_circle',         label: 'Lecture'            },
  { name: 'radio',               label: 'Radio'              },
  { name: 'tv',                  label: 'TV'                 },
  { name: 'live_tv',             label: 'Direct'             },
  // Marketing & Commerce
  { name: 'campaign',            label: 'Campagne'           },
  { name: 'ads_click',           label: 'Publicité'         },
  { name: 'sell',                label: 'Vente'              },
  { name: 'local_offer',         label: 'Offre'              },
  { name: 'storefront',          label: 'Boutique'           },
  { name: 'redeem',              label: 'Cadeau/Promo'       },
  { name: 'loyalty',             label: 'Fidélité'           },
  { name: 'shopping_bag',        label: 'Shopping'           },
  // Stratégie & Business
  { name: 'lightbulb',          label: 'Idée / Conseil'     },
  { name: 'analytics',           label: 'Analytique'         },
  { name: 'trending_up',         label: 'Croissance'         },
  { name: 'insights',            label: 'Insights'           },
  { name: 'bar_chart',           label: 'Graphique'          },
  { name: 'show_chart',          label: 'Courbe'             },
  { name: 'flag',                label: 'Objectif'           },
  { name: 'rocket_launch',       label: 'Lancement'          },
  { name: 'psychology',          label: 'Psychologie'        },
  { name: 'workspace_premium',   label: 'Premium'            },
  // Événementiel & Social
  { name: 'celebration',         label: 'Célébration'        },
  { name: 'event',               label: 'Événement'          },
  { name: 'groups',              label: 'Groupes'            },
  { name: 'people',              label: 'Personnes'          },
  { name: 'handshake',           label: 'Partenariat'        },
  { name: 'diversity_3',         label: 'Diversité'          },
  { name: 'volunteer_activism',  label: 'Engagement'         },
  { name: 'hub',                 label: 'Réseau'             },
  // Print & Identité
  { name: 'article',             label: 'Article'            },
  { name: 'description',         label: 'Document'           },
  { name: 'newspaper',           label: 'Presse'             },
  { name: 'badge',               label: 'Badge'              },
  { name: 'qr_code',             label: 'QR Code'            },
  { name: 'print',               label: 'Impression'         },
  { name: 'space_dashboard',     label: 'Dashboard'          },
  // Général
  { name: 'star',                label: 'Étoile'             },
  { name: 'bolt',                label: 'Rapidité'           },
  { name: 'radar',               label: 'Veille'             },
  { name: 'visibility',          label: 'Visibilité'         },
  { name: 'search',              label: 'Recherche'          },
  { name: 'verified',            label: 'Certifié'           },
  { name: 'security',            label: 'Sécurité'           },
  { name: 'support_agent',       label: 'Support'            },
  { name: 'speed',               label: 'Performance'        },
  { name: 'emoji_objects',       label: 'Innovation'         },
]

interface Props {
  value:    string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = search
    ? ICONS.filter(i => i.name.includes(search.toLowerCase()) || i.label.toLowerCase().includes(search.toLowerCase()))
    : ICONS

  return (
    <div className="relative" ref={ref}>
      {/* Bouton déclencheur */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 bg-surface border border-white/10 hover:border-brand focus:border-brand text-on-surface px-4 py-3 outline-none font-body transition-colors text-left"
      >
        {value ? (
          <>
            <span className="material-symbols-outlined text-brand" style={{ fontSize: '1.4rem' }}>{value}</span>
            <span className="text-sm font-mono text-on-surface-muted">{value}</span>
          </>
        ) : (
          <span className="text-sm text-on-surface-muted">Choisir une icône…</span>
        )}
        <span className="material-symbols-outlined ml-auto text-on-surface-muted" style={{ fontSize: '1rem' }}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Panneau déroulant */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface-container border border-white/10 shadow-2xl">
          {/* Recherche */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 bg-surface border border-white/10 px-3 py-2">
              <span className="material-symbols-outlined text-on-surface-muted" style={{ fontSize: '1rem' }}>search</span>
              <input
                type="text"
                placeholder="Rechercher une icône…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-on-surface text-sm outline-none font-body placeholder:text-on-surface-muted"
                autoFocus
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <span className="material-symbols-outlined text-on-surface-muted hover:text-white" style={{ fontSize: '1rem' }}>close</span>
                </button>
              )}
            </div>
          </div>

          {/* Grille d'icônes */}
          <div className="p-3 grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
            {filtered.map(icon => (
              <button
                key={icon.name}
                type="button"
                title={icon.label}
                onClick={() => { onChange(icon.name); setOpen(false); setSearch('') }}
                className={`flex flex-col items-center justify-center gap-1 p-2 transition-colors group ${
                  value === icon.name
                    ? 'bg-brand text-black'
                    : 'hover:bg-white/10 text-on-surface-muted hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>{icon.name}</span>
                <span className="text-[9px] font-body leading-none text-center truncate w-full">
                  {icon.label}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-8 py-6 text-center">
                <p className="font-body text-on-surface-muted text-xs">Aucune icône trouvée</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
