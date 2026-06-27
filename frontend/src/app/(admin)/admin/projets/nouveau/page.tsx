'use client'
import ProjectForm from '@/components/admin/ProjectForm'

export default function NouveauProjetPage() {
  return (
    <div>
      <p className="label mb-1">PROJETS</p>
      <h1 className="headline-md text-white mb-8">Nouveau projet</h1>
      <ProjectForm />
    </div>
  )
}
