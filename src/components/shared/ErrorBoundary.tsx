import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    /** Optional: send to LogRocket / Sentry later */
    componentDidCatch(error: Error, info: unknown) {
        if (import.meta.env.DEV) console.error("Uncaught error:", error, info);
    }

    handleRetry = () => this.setState({ hasError: false, error: null });

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 text-[var(--txt-primary)]">
                <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>

                {import.meta.env.DEV && this.state.error && (
                    <pre className="mb-4 max-w-xl whitespace-pre-wrap text-left text-[var(--txt-secondary)] overflow-auto">
                        {this.state.error.stack}
                    </pre>
                )}

                <button
                    onClick={this.handleRetry}
                    className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition"
                >
                    Try again
                </button>
            </div>
        );
    }
}
