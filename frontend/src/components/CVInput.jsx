import { useRef, useState, useCallback } from 'react'

export default function CVInput({ cvFile, setCvFile, cvTexto, setCvTexto }) {
  const [tab, setTab] = useState(cvFile ? 'file' : 'text')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') {
      setCvFile(f)
      setTab('file')
    }
  }, [setCvFile])

  const handleFileChange = useCallback((e) => {
    const f = e.target.files[0]
    if (f) {
      setCvFile(f)
      setTab('file')
    }
  }, [setCvFile])

  const removeFile = useCallback(() => {
    setCvFile(null)
    if (fileRef.current) fileRef.current.value = ''
    setTab('text')
  }, [setCvFile])

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">
        Tu currículum (CV) <span className="text-[var(--muted)] font-normal">(opcional)</span>
      </label>

      <div className="flex gap-1 mb-3" role="tablist">
        <button
          onClick={() => setTab('file')}
          role="tab"
          aria-selected={tab === 'file'}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            tab === 'file'
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'bg-transparent text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--accent-light)]'
          }`}
        >
          📎 Subir archivo
        </button>
        <button
          onClick={() => setTab('text')}
          role="tab"
          aria-selected={tab === 'text'}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            tab === 'text'
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'bg-transparent text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--accent-light)]'
          }`}
        >
          📝 Pegar texto
        </button>
      </div>

      {tab === 'file' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-[var(--accent)] bg-[var(--accent-light)]'
              : cvFile
                ? 'border-[var(--accent)] bg-[var(--accent-light)]/30'
                : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]/20'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {cvFile ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📄</span>
              <span className="font-medium text-sm text-[var(--ink)]">{cvFile.name}</span>
              <span className="text-xs text-[var(--muted)]">{(cvFile.size / 1024).toFixed(1)} KB</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile() }}
                className="mt-2 text-xs text-[var(--danger)] hover:underline"
              >
                Eliminar archivo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">📄</span>
              <span className="font-medium text-sm text-[var(--muted)]">
                Arrastra tu PDF aquí o haz clic para seleccionar
              </span>
              <span className="text-xs text-[var(--muted)]">Solo PDF</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            value={cvTexto}
            onChange={(e) => setCvTexto(e.target.value)}
            placeholder="Pega aquí el texto de tu currículum..."
            rows={6}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
          <div className="text-right mt-1 text-xs text-[var(--muted)]">
            {cvTexto.length} caracteres
          </div>
        </div>
      )}
    </div>
  )
}
