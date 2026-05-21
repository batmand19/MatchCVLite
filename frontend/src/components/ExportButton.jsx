import { useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'

export default function ExportButton({ resultado, printRef, onToast }) {
  const { handlePrint } = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'MatchCV-Lite-Analisis',
  })

  const handlePrintFallback = useCallback(() => {
    if (printRef?.current) {
      const content = printRef.current.innerHTML
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(`<html><head><title>MatchCV Lite - Análisis</title>
          <style>body { font-family: sans-serif; padding: 20px; }</style></head><body>
          ${content}</body></html>`)
        win.document.close()
        win.focus()
        win.print()
      }
    } else {
      window.print()
    }
  }, [printRef])

  const onPrint = handlePrint || handlePrintFallback

  const handleCopy = useCallback(() => {
    if (!resultado) return

    const formatList = (arr) => {
      if (!arr || !Array.isArray(arr) || arr.length === 0) return ''
      return '• ' + arr.join('\n• ')
    }

    const lines = [
      '═══════════════════════════════════',
      '       MATCHCV LITE — ANÁLISIS',
      '═══════════════════════════════════',
      '',
      `  📊 Encaje global:  ${resultado.encaje_global || 'N/A'}%`,
      `  🏷️  Nivel:         ${resultado.nivel || 'N/A'}`,
      '',
      '───────────────────────────────────',
      '  ✅ LO QUE APORTAS',
      '───────────────────────────────────',
      formatList(resultado.aporta),
      '',
      '───────────────────────────────────',
      '  ⚠️  BRECHAS DETECTADAS',
      '───────────────────────────────────',
      formatList(resultado.brechas),
      '',
      '───────────────────────────────────',
      '  💡 RECOMENDACIONES',
      '───────────────────────────────────',
      formatList(resultado.recomendaciones),
      '',
      '───────────────────────────────────',
      `  💬 ${resultado.frase_final || ''}`,
      '───────────────────────────────────',
    ]

    navigator.clipboard.writeText(lines.join('\n')).then(
      () => onToast?.('✅ Análisis copiado al portapapeles'),
      () => onToast?.('❌ No se pudo copiar, selecciona manualmente')
    )
  }, [resultado, onToast])

  if (!resultado) {
    return (
      <div className="flex gap-2 opacity-50">
        <button
          disabled
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border border-[var(--border)] bg-[var(--card-bg)] cursor-not-allowed"
          style={{ color: 'var(--muted)' }}
        >
          📋 Copiar análisis
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--accent-light)] transition-colors"
        style={{ color: 'var(--ink)' }}
      >
        📋 Copiar análisis al portapapeles
      </button>
      <button
        onClick={onPrint}
        className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] transition-colors"
      >
        🖨️ Exportar PDF
      </button>
    </div>
  )
}
