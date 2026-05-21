const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TIMEOUT = 20000

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    console.log(`[API] ${options.method || 'GET'} ${url}`)
    const r = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    const contentType = r.headers.get('content-type') || ''
    if (!r.ok) {
      let body = ''
      if (contentType.includes('application/json')) {
        const json = await r.json()
        body = json.error || JSON.stringify(json)
      } else {
        body = await r.text().catch(() => '')
      }
      throw new Error(`HTTP ${r.status}: ${body || r.statusText}`)
    }
    if (!contentType.includes('application/json')) {
      throw new Error(`Respuesta inesperada del servidor (status ${r.status}). Verifica que el backend esté corriendo en ${BASE}.`)
    }
    const data = await r.json()
    console.log(`[API] OK ${url}:`, data)
    return data
  } catch (err) {
    clearTimeout(id)
    if (err.name === 'AbortError') {
      throw new Error(`La conexión tardó demasiado (más de ${timeout / 1000}s). Asegúrate de que el servidor backend esté corriendo en ${BASE}.`)
    }
    throw err
  }
}

export async function analizarCV(cvFile, cvTexto, ofertaTexto) {
  const fd = new FormData()
  fd.append('oferta_texto', ofertaTexto)
  if (cvFile) fd.append('file', cvFile)
  if (cvTexto) fd.append('cv_texto', cvTexto)
  return fetchWithTimeout(`${BASE}/analizar`, { method: 'POST', body: fd })
}

export async function analizarMultiple(cvFile, cvTexto, ofertas) {
  const fd = new FormData()
  fd.append('ofertas', JSON.stringify(ofertas))
  if (cvFile) fd.append('file', cvFile)
  if (cvTexto) fd.append('cv_texto', cvTexto)
  return fetchWithTimeout(`${BASE}/analizar-multiple`, { method: 'POST', body: fd })
}

export async function calibrar(cvTexto, ofertaTexto, adiciones) {
  const cv = (cvTexto || '').trim()
  if (!cv || cv.length < 100) {
    throw new Error('El texto del CV debe tener al menos 100 caracteres para la simulación. Pega el texto del CV en la pestaña "Pegar texto".')
  }
  const of = (ofertaTexto || '').trim()
  if (!of || of.length < 20) {
    throw new Error('La oferta debe tener al menos 20 caracteres.')
  }
  const fd = new FormData()
  fd.append('cv_texto', cv)
  fd.append('oferta_texto', of)
  fd.append('adiciones', JSON.stringify(adiciones))
  return fetchWithTimeout(`${BASE}/calibrar`, { method: 'POST', body: fd })
}

export async function sugerirCV(cvFile, cvTexto, ofertaTexto) {
  const fd = new FormData()
  fd.append('oferta_texto', ofertaTexto)
  if (cvFile) fd.append('file', cvFile)
  if (cvTexto) fd.append('cv_texto', cvTexto)
  return fetchWithTimeout(`${BASE}/sugerir-cv`, { method: 'POST', body: fd })
}

export async function generarEntrevista(cvFile, cvTexto, ofertaTexto) {
  const fd = new FormData()
  fd.append('oferta_texto', ofertaTexto)
  if (cvFile) fd.append('file', cvFile)
  if (cvTexto) fd.append('cv_texto', cvTexto)
  return fetchWithTimeout(`${BASE}/entrevista`, { method: 'POST', body: fd })
}

export async function obtenerAnalytics() {
  return fetchWithTimeout(`${BASE}/analytics`)
}

export async function enviarFeedback(respuestas, sugerencia) {
  return fetchWithTimeout(`${BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respuestas, sugerencia }),
  })
}

export async function healthCheck() {
  try {
    const res = await fetchWithTimeout(`${BASE}/health`, {}, 5000)
    return true
  } catch {
    return false
  }
}
