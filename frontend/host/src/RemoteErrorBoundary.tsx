import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Microfrontend load/render failed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card border-secondary">
          <div className="card-body text-muted">
            Сервис временно не работает, проходят технические работы.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
