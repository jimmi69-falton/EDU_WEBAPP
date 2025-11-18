import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-50)]">
          <div className="card p-8 max-w-md w-full mx-4 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-[var(--status-danger)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-4">Oops! Có lỗi xảy ra</h2>
            <p className="text-[var(--neutral-600)] mb-6">
              Ứng dụng đã gặp lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.
            </p>
            
            <div className="space-y-3">
              <button
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
                onClick={() => window.location.reload()}
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span>Tải lại trang</span>
              </button>
              
              <button
                className="btn btn-secondary w-full"
                onClick={() => window.location.href = '/'}
              >
                Về trang chủ
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-[var(--neutral-500)] cursor-pointer mb-2">
                  Chi tiết lỗi (Development)
                </summary>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                  <pre className="text-[var(--status-danger)] whitespace-pre-wrap overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
