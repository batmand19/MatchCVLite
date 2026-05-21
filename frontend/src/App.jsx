import { useState, useRef, useEffect } from 'react'
import useDarkMode from './hooks/useDarkMode'
import { analizarCV, analizarMultiple, sugerirCV, obtenerAnalytics, healthCheck } from './api'
import Header from './components/Header'
import CVInput from './components/CVInput'
import OfferInput from './components/OfferInput'
import AnalysisResult from './components/AnalysisResult'
import Keywords from './components/Keywords'
import ATSContext from './components/ATSContext'

import ComparisonView from './components/ComparisonView'
import InterviewQuestions from './components/InterviewQuestions'
import CVSuggestion from './components/CVSuggestion'
import CVHighlighter from './components/CVHighlighter'
import ExportButton from './components/ExportButton'
import AIPromptButton from './components/AIPromptButton'
import Toast from './components/Toast'
import Skeleton from './components/Skeleton'
import ErrorBoundary from './components/ErrorBoundary'

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function App() {
  const [isDark, toggleDark] = useDarkMode()

  const [cvFile, setCvFile] = useState(null)
  const [cvTexto, setCvTexto] = useState('')
  const [ofertas, setOfertas] = useState([])
  const [modoMultiple, setModoMultiple] = useState(false)

  const [resultado, setResultado] = useState(null)
  const [resultadosMultiples, setResultadosMultiples] = useState([])
  const [sugerencias, setSugerencias] = useState(null)
  const [palabrasClave, setPalabrasClave] = useState([])
  const [contextoATS, setContextoATS] = useState([])
  const [herramientasFaltantes, setHerramientasFaltantes] = useState([])

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [buttonText, setButtonText] = useState('📄 Extrayendo CV...')
  const [analytics, setAnalytics] = useState(null)

  const resultsRef = useRef(null)
  const printRef = useRef(null)

  const onToast = (msg) => {
    setToastMsg(msg)
    setToastVisible(true)
  }

  useEffect(() => {
    obtenerAnalytics().then((d) => { if (d.exito) setAnalytics(d) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (cargando) {
      console.log('[App] Loading started')
      setButtonText('📄 Extrayendo CV...')
      const t1 = setTimeout(() => setButtonText('🔍 Analizando compatibilidad...'), 2000)
      const t2 = setTimeout(() => setButtonText('📊 Generando sugerencias...'), 5000)
      const safety = setTimeout(() => {
        console.warn('[App] Loading safety timeout (30s) fired')
        setCargando(false)
        setError('La conexión tardó demasiado. Verifica que el backend esté corriendo (python -m uvicorn backend.main:app --reload)')
      }, 30000)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(safety) }
    } else {
      console.log('[App] Loading finished')
    }
  }, [cargando])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('[App] handleSubmit called')
    setError(null)
    setResultado(null)
    setResultadosMultiples([])
    setSugerencias(null)
    setPalabrasClave([])
    setContextoATS([])
    setHerramientasFaltantes([])

    if (modoMultiple) {
      const ofertasList = ofertas.filter((l) => l.trim())
      if (ofertasList.length === 0) {
        setError('Pega al menos una oferta de trabajo.')
        return
      }
      if (!cvFile && !cvTexto.trim()) {
        setError('Pega tu CV o sube un archivo.')
        return
      }
      setCargando(true)
      try {
        console.log('[App] Calling analizarMultiple...')
        const data = await analizarMultiple(cvFile, cvTexto || null, ofertasList)
        console.log('[App] analizarMultiple response:', data)
        if (data.exito) {
          setResultadosMultiples(data.resultados || [])
          setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        } else {
          setError(data.error || 'Error al analizar las ofertas.')
        }
      } catch (err) {
        console.error('[App] analizarMultiple error:', err)
        setError(err.message || 'Error de conexión con el servidor.')
      }
      setCargando(false)
      return
    }

    const ofertaActual = ofertas[0]?.trim() || ''
    console.log('[App] ofertaActual length:', ofertaActual.length)

    if (!ofertaActual || ofertaActual.length < 30) {
      setError('La oferta debe tener al menos 30 caracteres.')
      return
    }
    if (!cvFile && !cvTexto.trim()) {
      setError('Pega tu CV o sube un archivo.')
      return
    }

    setCargando(true)
    try {
      console.log('[App] Calling analizarCV + sugerirCV...')
      const [resAnalizar, resSugerir] = await Promise.all([
        analizarCV(cvFile, cvTexto || null, ofertaActual),
        sugerirCV(cvFile, cvTexto || null, ofertaActual),
      ])
      console.log('[App] analizarCV OK:', { exito: resAnalizar.exito, encaje: resAnalizar.encaje_global })
      console.log('[App] sugerirCV OK:', { exito: resSugerir.exito, tiene_sugerencias: !!resSugerir.sugerencias_modificacion })

      if (resAnalizar.exito) {
        setResultado(resAnalizar)
        setPalabrasClave(resAnalizar.palabras_clave_oferta || [])
        setContextoATS(resAnalizar.contexto_ats || [])
      }

      if (resSugerir.exito) {
        setSugerencias(resSugerir.sugerencias_modificacion || null)
        if (resSugerir.sugerencias_modificacion?.herramientas_faltantes) {
          setHerramientasFaltantes(resSugerir.sugerencias_modificacion.herramientas_faltantes)
        }
        if (!resAnalizar.exito) {
          console.log('[App] Using sugerirCV as fallback for resultado')
          setResultado(resSugerir)
          setPalabrasClave(resSugerir.palabras_clave_oferta || [])
          setContextoATS(resSugerir.contexto_ats || [])
        }
      }

      if (!resAnalizar.exito && !resSugerir.exito) {
        setError('Ambos análisis fallaron. Revisa que el CV y la oferta tengan suficiente texto.')
      } else {
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    } catch (err) {
      console.error('[App] Error en handleSubmit:', err)
      setError(err.message || 'Error de conexión con el servidor.')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      <div className="no-print">
        <Header isDark={isDark} toggleDark={toggleDark} />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8 no-print">
          <h2 className="syne text-3xl sm:text-4xl font-bold leading-tight" style={{ color: 'var(--ink)' }}>
            ¿Tu CV encaja con esta vacante?
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            MatchCV Lite analiza tu currículum frente a una oferta de trabajo usando inteligencia artificial.
            Obtén un porcentaje de compatibilidad, descubre tus brechas y recibe recomendaciones para mejorar.
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-dark)' }}>
            <span>🔒</span>
            <span>No guardamos tu CV ni la oferta. Todo se procesa de forma anónima.</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 space-y-6 shadow-sm no-print">
          <CVInput
            cvFile={cvFile}
            setCvFile={setCvFile}
            cvTexto={cvTexto}
            setCvTexto={setCvTexto}
          />

          <div className="border-t border-[var(--border)]" />

          <OfferInput
            ofertas={ofertas}
            setOfertas={setOfertas}
            modoMultiple={modoMultiple}
            setModoMultiple={setModoMultiple}
          />

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 px-6 rounded-xl text-base font-bold bg-[var(--accent)] text-white disabled:opacity-60 hover:bg-[var(--accent-dark)] transition-colors flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <Spinner />
                {buttonText}
              </>
            ) : (
              '🔍 Analizar compatibilidad'
            )}
          </button>
        </form>

        {/* Error banner */}
        {error && (
          <div className="mt-6 rounded-xl bg-[var(--danger-light)] border border-[var(--danger)]/30 p-4 text-sm font-medium no-print" style={{ color: 'var(--danger)' }}>
            <div className="flex items-start gap-2">
              <span>❌</span>
              <div>
                <p className="font-semibold">Error</p>
                <p className="mt-0.5 opacity-80">{error}</p>
                {error.includes('localhost:8000') && (
                  <p className="mt-2 text-xs opacity-70">
                    Ejecuta en otra terminal: <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">python -m uvicorn backend.main:app --reload</code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div ref={resultsRef} className="mt-8 space-y-6">
          {cargando && !modoMultiple && <Skeleton visible />}

          {modoMultiple && resultadosMultiples.length > 0 && (
            <div className="space-y-4">
              <h3 className="syne text-xl font-bold" style={{ color: 'var(--ink)' }}>
                Resultados múltiples
              </h3>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-semibold text-[var(--ink)]">Comparación de puntuaciones</h4>
                {resultadosMultiples.map((r, i) => {
                  const score = Number(r.encaje_global) || 0
                  let barColor
                  if (score >= 70) barColor = 'var(--accent)'
                  else if (score >= 40) barColor = 'var(--warn)'
                  else barColor = 'var(--danger)'
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-16 text-right shrink-0 text-[var(--ink)]">
                        #{i + 1}
                      </span>
                      <div className="flex-1 h-7 rounded-full bg-[var(--border)] overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 min-w-[40px]"
                          style={{ width: `${Math.max(score, 4)}%`, backgroundColor: barColor }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow-sm">
                            {score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {resultadosMultiples.map((r, i) => (
                <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-sm">
                  <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>
                    Oferta #{r.indice !== undefined ? r.indice + 1 : i + 1}
                  </h4>
                  <AnalysisResult resultado={r} />
                </div>
              ))}
            </div>
          )}

          {!modoMultiple && resultado && (
            <div ref={printRef} className="space-y-6">
              <h3 className="syne text-xl font-bold" style={{ color: 'var(--ink)' }}>
                Resultado del análisis
              </h3>

              <ErrorBoundary>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-sm">
                  <AnalysisResult resultado={resultado} />
                </div>
              </ErrorBoundary>

              {palabrasClave.length > 0 && (
                <ErrorBoundary><Keywords palabras={palabrasClave} /></ErrorBoundary>
              )}

              {contextoATS.length > 0 && (
                <ErrorBoundary><ATSContext consejos={contextoATS} /></ErrorBoundary>
              )}

              <ErrorBoundary><CVSuggestion sugerencias={sugerencias} /></ErrorBoundary>

              <ErrorBoundary>
                <CVHighlighter
                  cvTexto={cvTexto}
                  ofertaTexto={ofertas[0] || ''}
                  resultado={resultado}
                  sugerencias={sugerencias}
                />
              </ErrorBoundary>

              <ErrorBoundary><ComparisonView resultado={resultado} /></ErrorBoundary>
            </div>
          )}

          {!modoMultiple && resultado && (
            <div className="no-print space-y-6 mt-6">
              <ErrorBoundary>
                <InterviewQuestions
                  cvFile={cvFile}
                  cvTexto={cvTexto}
                  ofertaTexto={ofertas[0] || ''}
                  analisisCompletado={!!resultado}
                />
              </ErrorBoundary>
              <ErrorBoundary>
                <ExportButton resultado={resultado} printRef={printRef} onToast={onToast} />
              </ErrorBoundary>
              <ErrorBoundary>
                <AIPromptButton
                  cvTexto={cvTexto}
                  cvFile={cvFile}
                  ofertaTexto={ofertas[0] || ''}
                  resultado={resultado}
                  sugerencias={sugerencias}
                  onToast={onToast}
                />
              </ErrorBoundary>
            </div>
          )}

          {!modoMultiple && !resultado && !cargando && !error && (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
              <span className="text-4xl">📊</span>
              <p className="mt-3 text-sm">Completa el formulario y presiona "Analizar compatibilidad" para ver los resultados.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-xs no-print space-y-2" style={{ color: 'var(--muted)' }}>
        {analytics && (
          <span className="mr-3">🔒 {analytics.total_analisis} análisis realizados · {analytics.hoy} hoy</span>
        )}
        <div>
          MatchCV Lite · Proyecto de código abierto · Hecho con el corazón y un poco de café ☕
        </div>
        <div className="space-x-3">
          <span>¿Proyectos, apoyo, sugerencias o reporte de errores?</span>
          <a href="mailto:hcanon@unal.edu.co" className="underline hover:opacity-80" style={{ color: 'var(--accent)' }}>
            hcanon@unal.edu.co
          </a>
          <span>·</span>
          <a
            href="https://www.linkedin.com/in/daniel-canon/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            LinkedIn
          </a>
        </div>
      </footer>

      <div className="no-print">
        <Toast mensaje={toastMsg} visible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </div>
  )
}
