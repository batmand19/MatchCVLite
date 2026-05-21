export default function CategoryBreakdown({ desglose }) {
  if (!desglose) return null

  const tooltips = {
    herramientas: "Mide qué tan bien tu CV cubre las herramientas técnicas que pide la oferta. Mejora: agrega las herramientas exactas que menciona la vacante.",
    funcional: "Evalúa si usas los mismos verbos de acción y términos clave que la oferta. Mejora: incorpora verbos como 'automatizar', 'optimizar', 'modelar'.",
    perfil: "Compara tu seniority y funciones con lo que busca la vacante. Mejora: alinea tu título profesional y nivel de experiencia.",
    claridad: "Revisa si tu CV tiene fechas, logros numéricos y viñetas. Mejora: agrega fechas, métricas y estructura con viñetas.",
  }

  const cats = [
    { key: 'herramientas', label: 'Herramientas', max: 35, color: 'var(--accent)' },
    { key: 'funcional', label: 'Funcional', max: 35, color: 'var(--accent)' },
    { key: 'perfil', label: 'Perfil', max: 20, color: 'var(--warn)' },
    { key: 'claridad', label: 'Claridad', max: 10, color: 'var(--accent)' },
  ]

  return (
    <div className="space-y-3 mt-4">
      <h4 className="text-sm font-semibold text-[var(--ink)]">Desglose por categoría</h4>
      {cats.map((c) => {
        const val = Number(desglose[c.key]) || 0
        const pct = Math.min((val / c.max) * 100, 100)
        return (
          <div key={c.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[var(--ink)] inline-flex items-center gap-1">
                {c.label}
                <span className="group relative inline-flex items-center">
                  <svg className="w-3.5 h-3.5 text-[var(--muted)] cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-lg bg-gray-900 dark:bg-gray-800 text-white text-[11px] leading-relaxed shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {tooltips[c.key]}
                  </div>
                </span>
              </span>
              <span className="text-[var(--muted)]">{val.toFixed(1)} / {c.max}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${pct}%`, backgroundColor: c.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
