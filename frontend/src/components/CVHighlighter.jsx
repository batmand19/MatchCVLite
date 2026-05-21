export default function CVHighlighter({ cvTexto, ofertaTexto, resultado, sugerencias }) {
  if (!cvTexto) return null

  const keywords = (resultado?.palabras_clave_oferta || []).filter(k => k && typeof k === 'string' && k.trim().length > 0)
  if (keywords.length === 0) return null

  const cvLower = cvTexto.toLowerCase()
  const matching = keywords.filter(k => cvLower.includes(k.toLowerCase()))
  const missing = keywords.filter(k => !cvLower.includes(k.toLowerCase()))

  let highlighted = cvTexto
  for (const kw of matching) {
    try {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escaped})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark class="bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 px-0.5 rounded">$1</mark>')
    } catch {
      // skip problematic keywords
    }
  }

  const mejoraItems = []
  if (sugerencias?.herramientas_faltantes) {
    for (const h of sugerencias.herramientas_faltantes) {
      mejoraItems.push({ label: h.herramienta || h, texto: h.recomendacion || `Incluye ${h.herramienta || h}` })
    }
  }
  if (sugerencias?.verbos_faltantes) {
    for (const v of sugerencias.verbos_faltantes) {
      mejoraItems.push({ label: v.verbo || v, texto: v.recomendacion || `Incluye el verbo '${v.verbo || v}'` })
    }
  }
  if (sugerencias?.sustantivos_faltantes) {
    for (const s of sugerencias.sustantivos_faltantes) {
      mejoraItems.push({ label: s, texto: `Incluye '${s}' en tu CV` })
    }
  }

  const sectionHeaders = ['HABILIDADES', 'EXPERIENCIA', 'TECNOLOGÍAS', 'EDUCACIÓN', 'LOGROS', 'RESUMEN', 'PERFIL']
  if (mejoraItems.length > 0) {
    for (const header of sectionHeaders) {
      const regex = new RegExp(`(${header})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 px-0.5 rounded" title="Área de mejora sugerida">$1</mark>')
    }
  }

  return (
    <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-3">
      <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
        👁️ Vista previa de tu CV
      </h4>
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1">
          <mark className="bg-green-200 dark:bg-green-700 px-1 rounded leading-relaxed">🟢 Coinciden</mark>
        </span>
        {mejoraItems.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <mark className="bg-yellow-200 dark:bg-yellow-700 px-1 rounded leading-relaxed">🟡 Mejora sugerida</mark>
          </span>
        )}
        {missing.length > 0 && (
          <span className="text-[var(--danger)]">
            🔴 {missing.length} término(s) no detectados
          </span>
        )}
      </div>
      <div
        className="rounded-lg border border-[var(--border)] p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-80 overflow-y-auto"
        style={{ color: 'var(--ink)', backgroundColor: 'var(--paper)' }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {matching.map(k => (
          <span
            key={k}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600"
          >
            🟢 {k}
          </span>
        ))}
        {mejoraItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-600 cursor-help"
            title={item.texto}
          >
            🟡 {item.label}
          </span>
        ))}
        {missing.map(k => (
          <span
            key={k}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600"
          >
            🔴 {k}
          </span>
        ))}
      </div>
    </div>
  )
}
