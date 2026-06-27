'use client'

export default function SmokeVideo() {
  return (
    <video
      src="/images/smoke.webm"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden
      className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-60 pointer-events-none"
    />
  )
}
