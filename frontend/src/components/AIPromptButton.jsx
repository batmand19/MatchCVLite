import { useState, useCallback, useRef } from 'react'

function buildPrompt(cvTexto, cvFile, ofertaTexto, resultado, sugerencias) {
  const lines = [
    'Eres un experto en optimización de currículums y reclutamiento tecnológico. Tu tarea es reescribir',
    'el CV que te proporcionaré para maximizar su compatibilidad con una oferta de trabajo específica.',
    '',
    '--- INSTRUCCIONES GENERALES ---',
    '1. Reescribe el CV manteniendo la experiencia real del candidato — NO inventes nada.',
    '2. Incorpora las palabras clave, herramientas y términos exactos que aparecen en la oferta.',
    '3. Usa verbos de acción de alto impacto (automaticé, implementé, lideré, optimicé, diseñé, desarrollé).',
    '4. Estructura el CV con secciones claras: Resumen Profesional, Experiencia, Habilidades Técnicas, Educación.',
    '5. Incluye logros cuantificables con números y porcentajes donde sea posible.',
    '6. Adapta el nivel de seniority y tono al que busca la oferta.',
    '7. NO uses frases genéricas como "soy responsable" o "trabajo en equipo" sin evidencia concreta.',
    '8. Resalta logros específicos con métricas: "reduje tiempos en X%", "lideré equipo de Y personas", "procesé Z registros".',
    '9. Devuelve SOLO el CV reescrito en formato texto plano, sin explicaciones adicionales.',
  ]

  const r = resultado
  if (r) {
    const score = Number(r.encaje_global) || 0
    const nivel = (r.nivel || '').toLowerCase()
    const desglose = r.desglose || {}

    lines.push('', '--- INSTRUCCIONES ESPECÍFICAS ---')

    if (score < 40) {
      lines.push('- La compatibilidad es MUY BAJA. Se necesita una reescritura profunda del CV.')
      lines.push('- Prioriza incluir TODAS las herramientas y tecnologías mencionadas en la oferta.')
      lines.push('- Ajusta el resumen profesional para que refleje EXACTAMENTE el perfil que busca la oferta.')
      lines.push('- Si faltan verbos de acción, reescribe cada punto de experiencia comenzando con un verbo fuerte.')
      lines.push('- Reorganiza las secciones para que lo más relevante aparezca primero.')
    } else if (score < 70) {
      lines.push('- La compatibilidad es media. El CV necesita ajustes específicos para llegar a 70%+.')
      lines.push('- Identifica qué herramientas/tecnologías de la oferta NO están en el CV y agrégalas.')
      lines.push('- Refuerza el resumen profesional alineándolo con el tono y seniority de la oferta.')
      lines.push('- Convierte descripciones de responsabilidades en logros con métricas.')
    } else {
      lines.push('- La compatibilidad es buena. El CV necesita optimización fina para llegar a 90%+.')
      lines.push('- Asegúrate de que cada palabra clave de la oferta aparezca exactamente en el CV.')
      lines.push('- Mejora la redacción de los logros con métricas más específicas.')
      lines.push('- Ajusta el formato y la estructura para máxima legibilidad por sistemas ATS.')
    }

    if (desglose.perfil !== undefined) {
      const perfilPct = Number(desglose.perfil) || 0
      const perfilMax = 20
      if (perfilPct < perfilMax * 0.5) {
        lines.push('- LA PUNTUACIÓN DE PERFIL ES BAJA. El título profesional y seniority no coinciden con la oferta.')
        lines.push('- Ajusta el título profesional en el encabezado para que coincida EXACTAMENTE con el rol de la oferta.')
        lines.push('- Revisa que los años de experiencia y nivel (Jr/Sr/SemiSr) estén alineados con lo que pide la oferta.')
        lines.push('- Si la oferta pide "Senior" y el CV muestra perfil "Junior", enfatiza logros de alta responsabilidad.')
        lines.push('- Incluye en el resumen una frase que posicione al candidato en el nivel correcto.')
      }
    }

    if (desglose.herramientas !== undefined) {
      const toolsPct = Number(desglose.herramientas) || 0
      const toolsMax = 35
      if (toolsPct < toolsMax * 0.5) {
        lines.push('- HAY MUCHAS HERRAMIENTAS FALTANDO. Revisa la lista de herramientas/tecnologías a añadir abajo.')
        lines.push('- Crea una sección de "Habilidades Técnicas" que liste exactamente las herramientas de la oferta.')
      }
    }

    if (desglose.funcional !== undefined) {
      const funcPct = Number(desglose.funcional) || 0
      const funcMax = 35
      if (funcPct < funcMax * 0.5) {
        lines.push('- LOS VERBOS DE ACCIÓN Y TÉRMINOS FUNCIONALES SON ESCASOS. Reemplaza verbos genéricos.')
        lines.push('- Cada punto de experiencia debe empezar con: automaticé, implementé, lideré, diseñé, optimicé, desarrollé.')
      }
    }

    if (desglose.claridad !== undefined) {
      const clarPct = Number(desglose.claridad) || 0
      const clarMax = 10
      if (clarPct < clarMax * 0.5) {
        lines.push('- LA CLARIDAD DEL CV ES BAJA. Agrega fechas en cada puesto, usa viñetas y añade métricas numéricas.')
        lines.push('- Cada logro debe seguir la estructura: "Verbo + qué hiciste + resultado cuantificable".')
      }
    }

    lines.push('', '--- ANÁLISIS DE COMPATIBILIDAD ---')
    lines.push(`Puntuación global: ${score}%`)
    lines.push(`Nivel: ${r.nivel || 'N/A'}`)
    lines.push('')
    if (r.aporta && r.aporta.length > 0) {
      lines.push('Lo que ya aporta el CV (conservar y reforzar):')
      r.aporta.forEach((a) => lines.push(`  ✅ ${a}`))
      lines.push('')
    }
    if (r.brechas && r.brechas.length > 0) {
      lines.push('Brechas detectadas (DEBEN CORREGIRSE):')
      r.brechas.forEach((b) => lines.push(`  ⚠️ ${b}`))
      lines.push('')
    }
    if (r.recomendaciones && r.recomendaciones.length > 0) {
      lines.push('Recomendaciones específicas:')
      r.recomendaciones.forEach((rec) => lines.push(`  💡 ${rec}`))
      lines.push('')
    }
    if (r.frase_final) {
      lines.push(`Observación final: "${r.frase_final}"`)
      lines.push('')
    }
  }

  const s = sugerencias
  if (s) {
    lines.push('--- SUGERENCIAS DE MEJORA ---')
    if (s.herramientas_faltantes && s.herramientas_faltantes.length > 0) {
      lines.push('Herramientas/tecnologías a añadir:')
      s.herramientas_faltantes.forEach((h) => {
        const name = h.herramienta || h
        const rec = h.recomendacion || `Incluye ${name}`
        lines.push(`  🔧 ${name}: ${rec}`)
      })
      lines.push('')
    }
    if (s.verbos_faltantes && s.verbos_faltantes.length > 0) {
      lines.push('Verbos de acción a incluir:')
      s.verbos_faltantes.forEach((v) => {
        const name = v.verbo || v
        const rec = v.recomendacion || `Incluye '${name}'`
        lines.push(`  ⚡ ${name}: ${rec}`)
      })
      lines.push('')
    }
    if (s.sustantivos_faltantes && s.sustantivos_faltantes.length > 0) {
      lines.push('Conceptos clave a incorporar:')
      s.sustantivos_faltantes.forEach((sn) => lines.push(`  📚 ${sn}`))
      lines.push('')
    }
    if (s.frases_ejemplo && s.frases_ejemplo.length > 0) {
      lines.push('Frases sugeridas para inspirarte (puedes usarlas como modelo):')
      s.frases_ejemplo.forEach((f) => lines.push(`  " ${f}"`))
      lines.push('')
    }
  }

  lines.push('', '--- DATOS DEL CANDIDATO ---')
  lines.push(cvTexto || (cvFile ? `[Archivo: ${cvFile.name}]` : '[No proporcionado]'))

  lines.push('', '--- OFERTA DE TRABAJO ---')
  lines.push(ofertaTexto)

  lines.push('', '--- FIN DEL PROMPT ---')
  lines.push('Ahora escribe el CV optimizado en texto plano, SOLO el CV, sin explicaciones.')
  return lines.join('\n')
}

export default function AIPromptButton({ cvTexto, cvFile, ofertaTexto, resultado, sugerencias, onToast }) {
  const [copied, setCopied] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const textareaRef = useRef(null)

  const hasData = (cvTexto || cvFile) && ofertaTexto && resultado

  const handleCopy = useCallback(() => {
    if (!hasData) return
    const prompt = buildPrompt(cvTexto, cvFile, ofertaTexto, resultado, sugerencias)
    navigator.clipboard.writeText(prompt).then(
      () => {
        setCopied(true)
        onToast?.('✅ Prompt copiado al portapapeles. Pégalo en ChatGPT, Claude o Gemini.')
        setTimeout(() => setCopied(false), 3000)
      },
      () => {
        onToast?.('ℹ️ Selecciona el texto manualmente desde el área de texto debajo.')
        setShowFull(true)
      }
    )
  }, [cvTexto, cvFile, ofertaTexto, resultado, sugerencias, hasData, onToast])

  const handleSelectAll = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.select()
      navigator.clipboard.writeText(textareaRef.current.value).catch(() => {})
    }
  }, [])

  if (!hasData) {
    return (
      <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-2 opacity-50">
        <h4 className="text-sm font-bold" style={{ color: 'var(--muted)' }}>
          🤖 Mejorar CV con IA
        </h4>
        <p className="text-xs text-[var(--muted)] italic">
          Completa el análisis primero
        </p>
        <button
          disabled
          className="w-full py-2 px-4 rounded-lg text-sm font-semibold border border-[var(--border)] bg-[var(--card-bg)] text-[var(--muted)] cursor-not-allowed"
        >
          📋 Generar prompt para IA
        </button>
      </div>
    )
  }

  const fullPrompt = buildPrompt(cvTexto, cvFile, ofertaTexto, resultado, sugerencias)

  return (
    <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--accent)]/30 p-4 space-y-3">
      <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
        🤖 Mejorar CV con IA
      </h4>
      <p className="text-xs text-[var(--muted)] leading-relaxed">
        Copia este prompt y pégalo en ChatGPT, Claude o Gemini junto con tu CV actual para obtener
        una versión optimizada con todas las mejoras y recomendaciones detectadas.
      </p>
      <button
        onClick={handleCopy}
        className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
          copied
            ? 'bg-[var(--accent)] text-white'
            : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]'
        }`}
      >
        {copied ? '✅ ¡Copiado!' : '📋 Copiar prompt para IA'}
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => setShowFull(!showFull)}
          className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors underline"
        >
          {showFull ? 'Ocultar prompt completo' : 'Ver prompt completo'}
        </button>
        {showFull && (
          <button
            onClick={handleSelectAll}
            className="text-xs text-[var(--accent)] hover:underline transition-colors"
          >
            Seleccionar todo
          </button>
        )}
      </div>

      {showFull ? (
        <textarea
          ref={textareaRef}
          readOnly
          value={fullPrompt}
          onClick={(e) => e.target.select()}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--paper)] p-3 text-xs font-mono leading-relaxed resize-y focus:outline-none"
          style={{ color: 'var(--ink)', minHeight: '200px' }}
        />
      ) : (
        <div className="rounded-lg bg-[var(--paper)] border border-[var(--border)] p-3 max-h-48 overflow-y-auto">
          <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono" style={{ color: 'var(--muted)' }}>
            {fullPrompt.slice(0, 600)}
            {'\n\n... (presiona "Ver prompt completo" para ver todo)'}
          </pre>
        </div>
      )}
    </div>
  )
}
