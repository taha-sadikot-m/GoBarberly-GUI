import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service in production
    if (import.meta.env.PROD) {
      // Example: Send to error tracking service
      // errorTrackingService.logError(error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: '#f8fafc',
        }}>
          <Card style={{ maxWidth: '32rem', width: '100%' }}>
            <div style={{
              textAlign: 'center',
              padding: '2rem',
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
              }}>
                😵
              </div>
              
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#1f2937',
              }}>
                Something went wrong
              </h2>
              
              <p style={{
                color: '#6b7280',
                marginBottom: '2rem',
                lineHeight: '1.5',
              }}>
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </p>

              {/* Show error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <details style={{
                  marginBottom: '2rem',
                  padding: '1rem',
                  backgroundColor: '#fee2e2',
                  borderRadius: '0.5rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  color: '#dc2626',
                }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Error Details (Development Only)
                  </summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Stack:</strong>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap', 
                      fontSize: '0.75rem',
                      marginTop: '0.25rem' 
                    }}>
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Component Stack:</strong>
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        fontSize: '0.75rem',
                        marginTop: '0.25rem' 
                      }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </details>
              )}

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                <Button onClick={this.handleReload}>
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="ghost"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;