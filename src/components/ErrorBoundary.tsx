import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error | null;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    // For now, just log to console for visibility during development
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;

      return (
        <div style={{ padding: 24 }}>
          <h2>Algo deu errado.</h2>
          <p>Ocorreu um erro inesperado na aplicação.</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => window.location.reload()}>Recarregar</button>
            <button onClick={this.reset} style={{ marginLeft: 8 }}>
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
