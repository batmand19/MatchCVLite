export default function ATSContext({ consejos }) {
  if (!consejos || consejos.length === 0) return null

  return (
    <div className="rounded-xl bg-[var(--ats-bg)] border border-[var(--ats-border)] p-4">
      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--ats-text)' }}>
        🤖 Contexto ATS
      </h4>
      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--ats-text)' }}>
        El análisis utiliza TF-IDF para identificar términos relevantes. Los sistemas ATS (Applicant Tracking
        System) buscan coincidencias exactas con la oferta. Un CV optimizado supera los filtros automáticos
        antes de llegar a un reclutador.
      </p>
      <ul className="space-y-1.5">
        {consejos.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ats-text)' }}>
            <span>•</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
