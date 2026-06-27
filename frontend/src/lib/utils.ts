/**
 * Génère un slug URL-friendly depuis un titre
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Formate une date en français
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('fr-FR', options || {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Tronque un texte à une longueur maximale
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Formate un nombre avec séparateur de milliers (style français)
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

/**
 * Retourne les classes CSS conditionnellement
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
