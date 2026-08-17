import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Uncaught error:", error, info);
    }

    // TODO: Add production error reporting here
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center text-txt-primary">
        <h1 className="mb-4 text-3xl font-bold">Something went wrong</h1>

        {import.meta.env.DEV && this.state.error && (
          <pre className="mb-4 max-w-xl overflow-auto whitespace-pre-wrap text-left text-txt-secondary">
            {this.state.error.stack}
          </pre>
        )}

        <button
          type="button"
          onClick={this.handleRetry}
          className="rounded-lg bg-accent px-4 py-2 text-txt-highlight transition hover:bg-accent-hover"
        >
          Reload application
        </button>
      </div>
    );
  }
}
