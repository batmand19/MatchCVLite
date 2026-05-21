export default function Keywords({ palabras }) {
  if (!palabras || palabras.length === 0) return null

  return (
    <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4">
      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--ats-text)' }}>
        🔑 Palabras clave que los sistemas ATS buscarán
      </h4>
      <div className="flex flex-wrap gap-2">
        {palabras.map((p, i) => (
          <span
            key={i}
            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--ats-bg)',
              color: 'var(--ats-text)',
              border: '1px solid var(--ats-border)',
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}
