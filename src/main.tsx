import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class StudioErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Prearn Studio Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('prearn_gamma_projects_v4');
      localStorage.removeItem('prearn_gamma_seeded_v4');
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#090A10] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#141522] border border-white/10 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center text-xl font-bold mb-4 shadow-gamma-glow">
              ✦
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Prearn Design Studio</h2>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              An unexpected error occurred while rendering the canvas. You can reload the app with fresh starter templates.
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-red-300 text-left mb-6 overflow-x-auto max-h-32">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-gamma-glow transition-all"
            >
              Reset & Reload Studio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StudioErrorBoundary>
      <App />
    </StudioErrorBoundary>
  </React.StrictMode>
);
