export default function CVSuggestion({ sugerencias }) {
  if (!sugerencias) return null

  const { herramientas_faltantes, verbos_faltantes, sustantivos_faltantes, frases_ejemplo } = sugerencias

  const hasData = (herramientas_faltantes && herramientas_faltantes.length > 0) ||
    (verbos_faltantes && verbos_faltantes.length > 0) ||
    (sustantivos_faltantes && sustantivos_faltantes.length > 0) ||
    (frases_ejemplo && frases_ejemplo.length > 0)

  if (!hasData) return null

  return (
    <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-4">
      <h4 className="text-sm font-bold text-[var(--accent)]">📝 Sugerencias para tu CV</h4>

      {herramientas_faltantes && herramientas_faltantes.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-[var(--warn)] mb-1">
            Herramientas / tecnologías que podrías añadir:
          </h5>
          <ul className="list-disc list-inside text-xs space-y-0.5" style={{ color: 'var(--ink)' }}>
            {herramientas_faltantes.map((h, i) => (
              <li key={i}>{h.recomendacion || h.herramienta || JSON.stringify(h)}</li>
            ))}
          </ul>
        </div>
      )}

      {verbos_faltantes && verbos_faltantes.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-[var(--warn)] mb-1">
            Verbos de acción que faltan en tu CV:
          </h5>
          <ul className="list-disc list-inside text-xs space-y-0.5" style={{ color: 'var(--ink)' }}>
            {verbos_faltantes.map((v, i) => (
              <li key={i}>{v.recomendacion || v.verbo || JSON.stringify(v)}</li>
            ))}
          </ul>
        </div>
      )}

      {sustantivos_faltantes && sustantivos_faltantes.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-[var(--warn)] mb-1">
            Sustantivos / conceptos clave que podrías incluir:
          </h5>
          <ul className="list-disc list-inside text-xs space-y-0.5" style={{ color: 'var(--ink)' }}>
            {sustantivos_faltantes.map((s, i) => (
              <li key={i}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>
            ))}
          </ul>
        </div>
      )}

      {frases_ejemplo && frases_ejemplo.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-[var(--accent-dark)] mb-2">
            Frases sugeridas para tu CV:
          </h5>
          <div className="space-y-2">
            {frases_ejemplo.map((frase, i) => (
              <div
                key={i}
                className="rounded-lg bg-[var(--accent-light)] p-3 border border-[var(--accent)]/30"
              >
                <p className="text-sm italic leading-relaxed" style={{ color: 'var(--ink)' }}>
                  "{typeof frase === 'string' ? frase : JSON.stringify(frase)}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
