import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * Global React Error Boundary
 * Catches JavaScript errors anywhere in their child component tree,
 * logs the errors, and displays a graceful fallback UI styled with Hayroo tokens.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Hayroo App Error Boundary]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)] text-[var(--color-text)] font-sans">
          <div className="max-w-md w-full card p-6 sm:p-8 text-center space-y-5 border border-[var(--color-border)] shadow-lg">
            <div className="w-14 h-14 rounded-md bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold font-heading text-[var(--color-text)]">
                Something went wrong
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                An unexpected interface error occurred. You can reload this page or return to the storefront homepage.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-primary btn-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn-secondary btn-sm flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Return to Store</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
