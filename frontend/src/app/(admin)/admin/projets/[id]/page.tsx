'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProjectForm from '@/components/admin/ProjectForm'
import api from '@/lib/api'

export default function EditProjetPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/admin/projects/${id}`)
      .then(r => setProject(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="card p-12 text-center bg-surface-container">
      <p className="label">Chargement...</p>
    </div>
  )

  return (
    <div>
      <p className="label mb-1">PROJETS</p>
      <h1 className="headline-md text-white mb-8">Modifier le projet</h1>
      <ProjectForm initialData={project} projectId={id as string} />
    </div>
  )
}
