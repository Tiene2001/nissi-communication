import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && <label className="label block mb-2">{label}</label>}
      <input
        className={`w-full bg-surface-container border ${error ? 'border-red-500' : 'border-white/10'} focus:border-brand text-on-surface px-4 py-3 outline-none transition-colors font-body ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 font-body text-xs mt-1">{error}</p>}
    </div>
  )
}
