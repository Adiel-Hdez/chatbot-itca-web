import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    localStorage.removeItem('itca_admin')
    localStorage.removeItem('chatbot_user')
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-800 shadow-xl">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-[#851016]">Inconveniente al cargar la vista</h2>
            <p className="text-sm text-slate-600 mb-6">
              Hubo un detalle al cargar los componentes de la interfaz institucional.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-[#851016] hover:bg-[#700d12] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#851016]/20 cursor-pointer"
            >
              Reiniciar sesión
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
