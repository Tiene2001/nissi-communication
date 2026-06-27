interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function Loader({ size = 'md', label }: Props) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizes[size]} border-2 border-brand border-t-transparent animate-spin`}
        role="status"
        aria-label="Chargement"
      />
      {label && <p className="label">{label}</p>}
    </div>
  )
}
