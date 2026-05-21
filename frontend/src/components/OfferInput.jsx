import { useCallback } from 'react'

const OFERTA_EJEMPLO = `Desarrollador/a Frontend Senior

Buscamos un/a desarrollador/a frontend con experiencia en React, TypeScript y TailwindCSS para unirse a nuestro equipo de producto. La persona seleccionada será responsable de implementar interfaces de usuario modernas, accesibles y de alto rendimiento.

Requisitos:
- 5+ años de experiencia en desarrollo frontend
- Dominio de React, TypeScript, JavaScript ES6+
- Experiencia con TailwindCSS o sistemas de diseño similares
- Conocimiento de testing (Jest, React Testing Library)
- Experiencia con consumo de APIs REST
- Git y flujo de trabajo colaborativo
- Inglés técnico (lectura y escritura)

Valorable:
- Experiencia con Next.js o Remix
- Conocimiento de animaciones CSS y librerías como Framer Motion
- Experiencia con GraphQL
- Conocimiento de accesibilidad web (WCAG)
- Experiencia en CI/CD

Ofrecemos:
- Salario competitivo (45-60K)
- Trabajo 100% remoto
- Horario flexible
- Formación continua
- Equipo internacional y diverso`

export default function OfferInput({
  ofertas, setOfertas,
  modoMultiple, setModoMultiple,
}) {
  const handleSingleChange = useCallback((e) => {
    setOfertas([e.target.value])
  }, [setOfertas])

  const handleMultiChange = useCallback((idx, val) => {
    setOfertas((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }, [setOfertas])

  const addOffer = useCallback(() => {
    setOfertas((prev) => [...prev, ''])
  }, [setOfertas])

  const removeOffer = useCallback((idx) => {
    setOfertas((prev) => prev.filter((_, i) => i !== idx))
  }, [setOfertas])

  const cargarEjemplo = useCallback(() => {
    setOfertas([OFERTA_EJEMPLO])
  }, [setOfertas])

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">
        Oferta de trabajo
      </label>

      <div className="flex gap-1 mb-3" role="tablist">
        <button
          onClick={() => { setModoMultiple(false); setOfertas((prev) => prev.length > 0 ? [prev[0]] : ['']) }}
          role="tab"
          aria-selected={!modoMultiple}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            !modoMultiple
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'bg-transparent text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--accent-light)]'
          }`}
        >
          Una oferta
        </button>
        <button
          onClick={() => { setModoMultiple(true) }}
          role="tab"
          aria-selected={modoMultiple}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            modoMultiple
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'bg-transparent text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--accent-light)]'
          }`}
        >
          Varias ofertas
        </button>
      </div>

      {modoMultiple ? (
        <div className="space-y-3">
          {ofertas.map((of, idx) => (
            <div key={idx} className="relative">
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Oferta #{idx + 1}
              </label>
              <textarea
                value={of}
                onChange={(e) => handleMultiChange(idx, e.target.value)}
                rows={5}
                placeholder="Pega aquí la descripción de la oferta..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent pr-10"
              />
              {ofertas.length > 1 && (
                <button
                  onClick={() => removeOffer(idx)}
                  className="absolute top-6 right-2 w-6 h-6 flex items-center justify-center rounded-full text-base font-bold text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors"
                  title="Eliminar oferta"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addOffer}
            type="button"
            className="w-full py-2 rounded-lg text-sm font-medium border-2 border-dashed border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            + Agregar otra oferta
          </button>
        </div>
      ) : (
        <textarea
          value={ofertas[0] || ''}
          onChange={handleSingleChange}
          placeholder="Pega aquí la descripción de la oferta..."
          rows={6}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        />
      )}

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-[var(--muted)]">
          {modoMultiple
            ? `${ofertas.length} oferta(s)`
            : `${(ofertas[0] || '').length} caracteres`
          }
        </span>
        <button
          onClick={cargarEjemplo}
          type="button"
          className="text-xs text-[var(--accent)] hover:underline font-medium"
        >
          📋 Cargar oferta de ejemplo
        </button>
      </div>
    </div>
  )
}
