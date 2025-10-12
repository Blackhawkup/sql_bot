import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-4">The application encountered an error and crashed.</p>
            <button 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-gray-400">Error Details</summary>
              <pre className="mt-2 p-4 bg-gray-800 rounded text-xs text-red-300 overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
