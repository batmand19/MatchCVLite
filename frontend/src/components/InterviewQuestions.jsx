import { useState } from 'react'
import { generarEntrevista } from '../api'

const CATEGORY_MAP = {
  herramienta: { icon: '🔧', label: 'Herramientas' },
  verbo_accion: { icon: '⚡', label: 'Verbos de acción' },
  concepto: { icon: '📚', label: 'Conceptos' },
  rol: { icon: '👔', label: 'Rol' },
  logro: { icon: '🏆', label: 'Logros' },
  seniority: { icon: '📈', label: 'Seniority' },
  general: { icon: '💡', label: 'General' },
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function InterviewQuestions({ cvFile, cvTexto, ofertaTexto, analisisCompletado }) {
  const [preguntas, setPreguntas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const data = await generarEntrevista(cvFile, cvTexto, ofertaTexto)
      if (data.exito) {
        setPreguntas(data.preguntas || [])
        setTotal(data.total || 0)
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const grouped = preguntas
    ? Object.fromEntries(
        Object.entries(
          preguntas.reduce((acc, p) => {
            const cat = p.categoria || 'general'
            if (!acc[cat]) acc[cat] = []
            acc[cat].push(p.pregunta)
            return acc
          }, {})
        )
          .slice(0, 5)
          .map(([cat, qs]) => [cat, qs.slice(0, 2)])
      )
    : {}

  return (
    <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-3">
      <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
        🎤 Preguntas para entrevista
      </h4>

      {!preguntas && (
        <p className="text-xs text-[var(--muted)]">
          Genera preguntas personalizadas basadas en la oferta y tu CV para preparar tu entrevista.
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}

      {!loading && !preguntas && analisisCompletado && (
        <button
          onClick={handleGenerate}
          className="w-full py-2 px-4 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] transition-colors"
        >
          Generar preguntas
        </button>
      )}

      {!loading && !preguntas && !analisisCompletado && (
        <p className="text-xs text-[var(--muted)] italic">
          Completa el análisis primero
        </p>
      )}

      {preguntas && !loading && (
        <div className="space-y-4">
          <div className="text-xs text-[var(--muted)]">
            {total} preguntas generadas
          </div>

          {Object.entries(grouped).map(([cat, questions]) => {
            const meta = CATEGORY_MAP[cat] || { icon: '💡', label: cat }
            return (
              <div key={cat}>
                <h5 className="text-xs font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>
                  {meta.icon} {meta.label}
                </h5>
                <ul className="space-y-1">
                  {questions.map((q, i) => (
                    <li
                      key={i}
                      className="text-sm leading-relaxed pl-3 border-l-2"
                      style={{ borderColor: 'var(--accent)', color: 'var(--ink)' }}
                    >
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
