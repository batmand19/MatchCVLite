import { useState, useEffect, useRef } from 'react'
import CategoryBreakdown from './CategoryBreakdown'

function AnimatedScore({ target }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const t = Number(target) || 0
    const dur = 1200
    const start = performance.now()
    const from = 0

    function step(now) {
      const elapsed = now - start
      const prog = Math.min(elapsed / dur, 1)
      const ease = 1 - Math.pow(1 - prog, 3)
      setVal(from + (t - from) * ease)
      if (prog < 1) raf.current = requestAnimationFrame(step)
    }

    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target])

  return <>{Math.round(val)}</>
}

function ScoreBadge({ nivel }) {
  const n = (nivel || '').toLowerCase()
  let bg, text, label
  if (n === 'buen encaje') {
    bg = 'bg-[var(--accent-light)]'
    text = 'text-[var(--accent-dark)]'
    label = '✅ Buen encaje'
  } else if (n === 'encaje medio' || n === 'medio') {
    bg = 'bg-[var(--warn-light)]'
    text = 'text-[var(--warn)]'
    label = '⚠️ Encaje medio'
  } else {
    bg = 'bg-[var(--danger-light)]'
    text = 'text-[var(--danger)]'
    label = '❌ Bajo encaje'
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  )
}

export default function AnalysisResult({ resultado }) {
  if (!resultado) return null

  const { encaje_global, nivel, aporta, brechas, recomendaciones, frase_final, desglose } = resultado

  const renderList = (items, prefix, colorClass) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null
    return (
      <ul className={`space-y-1 ${colorClass}`}>
        {items.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed flex items-start gap-2">
            <span className="shrink-0 mt-0.5">{prefix}</span>
            <span style={{ color: 'var(--ink)' }}>{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="text-center py-6">
        <div className="syne text-5xl font-bold text-[var(--accent)]">
          <AnimatedScore target={encaje_global} />
          <span className="text-2xl text-[var(--muted)] ml-1">%</span>
        </div>
        <div className="mt-2">
          <ScoreBadge nivel={nivel} />
        </div>
      </div>

      {/* Score bar */}
      <div className="h-3 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(Number(encaje_global) || 0, 100)}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>

      {/* Aportas */}
      {aporta && Array.isArray(aporta) && aporta.length > 0 && (
        <div className="rounded-xl bg-[var(--accent-light)] p-4 border border-[var(--accent)]/20">
          <h4 className="text-sm font-bold text-[var(--accent-dark)] mb-2">✅ Lo que aportas</h4>
          {renderList(aporta, '✅', 'text-[var(--accent-dark)]')}
        </div>
      )}

      {/* Brechas */}
      {brechas && Array.isArray(brechas) && brechas.length > 0 && (
        <div className="rounded-xl bg-[var(--danger-light)] p-4 border border-[var(--danger)]/20">
          <h4 className="text-sm font-bold text-[var(--danger)] mb-2">⚠️ Brechas detectadas</h4>
          {renderList(brechas, '⚠️', 'text-[var(--danger)]')}
        </div>
      )}

      {/* Recomendaciones */}
      {recomendaciones && Array.isArray(recomendaciones) && recomendaciones.length > 0 && (
        <div className="rounded-xl bg-[var(--info-light)] p-4 border border-blue-200/30">
          <h4 className="text-sm font-bold text-blue-700 mb-2">💡 Recomendaciones</h4>
          {renderList(recomendaciones, '💡', 'text-blue-700')}
        </div>
      )}

      {/* Desglose */}
      <CategoryBreakdown desglose={desglose} />

      {/* Frase final */}
      {frase_final && (
        <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 italic text-sm text-center leading-relaxed" style={{ color: 'var(--ink)' }}>
          "{frase_final}"
        </div>
      )}
    </div>
  )
}
