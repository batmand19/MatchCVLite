import { useState } from 'react'
import { calibrar } from '../api'

export default function CalibrationWidget({ cvTexto, ofertaTexto, herramientasFaltantes }) {
  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const toName = (h) =>
    typeof h === 'string' ? h : typeof h?.herramienta === 'string' ? h.herramienta : JSON.stringify(h)

  const items = (herramientasFaltantes || []).map((h) =>
    typeof h === 'string' ? { herramienta: h, recomendacion: h } : h
  )

  if (items.length === 0) return null

  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    )
  }

  const handleCalibrar = async () => {
    if (selected.length === 0) return
    const cv = (cvTexto || '').trim()
    if (!cv || cv.length < 100) {
      setErrorMsg('El texto del CV debe tener al menos 100 caracteres. Si subiste un archivo PDF, pega el texto manualmente en la pestaña "Pegar texto".')
      return
    }
    const of = (ofertaTexto || '').trim()
    if (!of || of.length < 20) {
      setErrorMsg('La oferta debe tener al menos 20 caracteres.')
      return
    }
    setErrorMsg(null)
    setResult(null)
    setLoading(true)
    try {
      const data = await calibrar(cvTexto, ofertaTexto, selected)
      if (data.exito) {
        setResult(data)
      } else {
        setErrorMsg(data.error || 'Error en la simulación.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error de conexión.')
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-3">
      <h4 className="text-sm font-bold text-[var(--accent)]">🔬 Simulación "¿Qué pasaría si...?"</h4>
      <p className="text-xs text-[var(--muted)]">
        Selecciona herramientas que podrías añadir a tu CV y calcula cómo cambiaría tu puntuación.
      </p>

      <div className="flex flex-wrap gap-2">
        {items.map((h, i) => {
          const name = toName(h)
          const active = selected.includes(name)
          return (
            <button
              key={name + i}
              onClick={() => toggle(name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-[var(--paper)] text-[var(--ink)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {active ? '✓ ' : '+ '}{name}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleCalibrar}
        disabled={loading || selected.length === 0}
        className="w-full py-2 px-4 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white disabled:opacity-50 hover:bg-[var(--accent-dark)] transition-colors"
      >
        {loading ? 'Calculando...' : 'Calcular simulación'}
      </button>

      {errorMsg && (
        <div className="rounded-lg bg-[var(--danger-light)] border border-[var(--danger)]/30 p-3 text-xs" style={{ color: 'var(--danger)' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {result && result.exito && (
        <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-[var(--accent-light)]">
          <div className="text-center">
            <div className="text-xs text-[var(--muted)]">Actual</div>
            <div className="syne text-xl font-bold" style={{ color: 'var(--ink)' }}>
              {Math.round(Number(result.actual))}%
            </div>
          </div>
          <div className="text-lg" style={{ color: 'var(--accent)' }}>→</div>
          <div className="text-center">
            <div className="text-xs text-[var(--muted)]">Proyectado</div>
            <div className="syne text-xl font-bold text-[var(--accent)]">
              {Math.round(Number(result.proyectado))}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[var(--muted)]">Diferencia</div>
            <div className="syne text-lg font-bold" style={{ color: Number(result.diferencia) >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
              {Number(result.diferencia) >= 0 ? '+' : ''}{Number(result.diferencia).toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
