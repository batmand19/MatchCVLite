export default function ComparisonView({ resultado }) {
  if (!resultado) return null

  const debug = resultado._debug_tools
  const keywords = resultado.palabras_clave_oferta || []

  if (debug) {
    const enOferta = debug.en_oferta || []
    const coincidentes = debug.coincidentes || []
    const faltantes = debug.faltantes || []
    const total = enOferta.length || 1
    const ratio = Math.round((coincidentes.length / total) * 100)

    return (
      <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-4">
        <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
          📊 Comparación lado a lado
        </h4>

        {ratio !== undefined && (
          <div className="text-xs text-[var(--muted)] text-center">
            Coincidencia de herramientas: {ratio}%
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-[var(--accent-light)]/50 border border-[var(--accent)]/20 p-3">
            <h5 className="text-xs font-semibold text-[var(--accent-dark)] mb-2">
              ✅ Coincidencias ({coincidentes.length})
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {coincidentes.length === 0 && (
                <span className="text-xs text-[var(--muted)]">Ninguna</span>
              )}
              {coincidentes.map((item, i) => (
                <span
                  key={i}
                  className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent-dark)] border border-[var(--accent)]/30"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-[var(--danger-light)]/50 border border-[var(--danger)]/20 p-3">
            <h5 className="text-xs font-semibold text-[var(--danger)] mb-2">
              ❌ Brechas ({faltantes.length})
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {faltantes.length === 0 && (
                <span className="text-xs text-[var(--muted)]">Ninguna</span>
              )}
              {faltantes.map((item, i) => (
                <span
                  key={i}
                  className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (keywords.length === 0) return null

  return (
    <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-3">
      <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
        📊 Palabras clave de la oferta
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((p, i) => (
          <span
            key={i}
            className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-light)] text-[var(--accent-dark)] border border-[var(--accent)]/20"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}
