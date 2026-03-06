import React from 'react';

/**
 * Class-based Error Boundary. Catches runtime errors in the child tree
 * and shows a fallback UI instead of a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorKey: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState((prev) => ({ hasError: false, errorKey: prev.errorKey + 1 }));
  };

  render() {
    if (this.state.hasError && this.props.fallback) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback({ resetErrorBoundary: this.resetErrorBoundary })
        : this.props.fallback;
    }
    return <React.Fragment key={this.state.errorKey}>{this.props.children}</React.Fragment>;
  }
}
