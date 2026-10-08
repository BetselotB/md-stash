import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isQuotaError =
        this.state.error?.name === 'QuotaExceededError' ||
        this.state.error?.message?.toLowerCase().includes('quota');

      return (
        <div className="min-h-screen bg-sage text-cream flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 bg-forest border border-line rounded-3xl shadow-card space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-forest-dark border border-line text-orange flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-display text-3xl tracking-normal text-cream">
                {isQuotaError ? 'Storage Quota Exceeded' : 'Something went wrong'}
              </h2>
              <p className="text-xs text-cream-dim mt-2 leading-relaxed">
                {isQuotaError
                  ? 'Your browser storage quota has been reached. Please free up space by exporting and pruning large files in Settings.'
                  : this.state.error?.message || 'An unexpected error occurred in your local stash session.'}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleReload}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
