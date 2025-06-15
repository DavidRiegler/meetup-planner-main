"use client"
import { Component, type ReactNode } from "react"
import type React from "react"

import { AlertCircle, RefreshCw, Home, Bug } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isDevelopment = process.env.NODE_ENV === "development"
      const showDetails = this.props.showDetails || isDevelopment

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">
              <AlertCircle size={64} className="text-destructive" />
            </div>

            <div className="error-boundary-content">
              <h1 className="error-boundary-title">Something went wrong</h1>
              <p className="error-boundary-message">
                We're sorry, but something unexpected happened. Please try refreshing the page or go back to the home
                page.
              </p>

              {showDetails && this.state.error && (
                <details className="error-boundary-details">
                  <summary className="error-boundary-summary">
                    <Bug size={16} />
                    Technical Details
                  </summary>
                  <div className="error-boundary-error-info">
                    <h4>Error Message:</h4>
                    <code>{this.state.error.message}</code>

                    {this.state.error.stack && (
                      <>
                        <h4>Stack Trace:</h4>
                        <pre className="error-boundary-stack">{this.state.error.stack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="error-boundary-actions">
              <button onClick={this.handleRetry} className="button button-primary">
                <RefreshCw size={16} />
                Try Again
              </button>
              <button onClick={this.handleGoHome} className="button button-outline">
                <Home size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
