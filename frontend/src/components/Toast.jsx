import { useEffect } from 'react'

export default function Toast({ mensaje, visible, onClose }) {
  useEffect(() => {
    if (visible && mensaje) {
      const timer = setTimeout(() => { onClose() }, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, mensaje, onClose])

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="px-5 py-3 rounded-full bg-gray-900 dark:bg-gray-800 text-white text-sm font-medium shadow-lg border border-gray-700">
        {mensaje}
      </div>
    </div>
  )
}
