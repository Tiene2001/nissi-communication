import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="label mb-4">ERREUR 404</p>
        <h1 className="font-headline font-bold text-brand text-8xl leading-none mb-6">404</h1>
        <p className="font-body text-on-surface-muted text-lg mb-12">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link href="/" className="btn-primary text-sm">
          RETOUR À L&apos;ACCUEIL
        </Link>
      </div>
    </div>
  )
}
