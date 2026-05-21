import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error capturado:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      console.warn('[ErrorBoundary] Mostrando fallback para:', this.state.error?.message)
      return (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm">
          <p className="font-semibold text-red-700 dark:text-red-300 mb-1">
            ⚠️ Error al mostrar esta sección
          </p>
          <p className="text-xs text-red-500 dark:text-red-400">
            {this.state.error?.message || 'Error desconocido'}
          </p>
          <details className="mt-2">
            <summary className="text-xs text-red-400 cursor-pointer">Ver detalle técnico</summary>
            <pre className="mt-1 text-xs text-red-300 overflow-auto max-h-32">{this.state.error?.stack || 'Sin stack trace'}</pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
