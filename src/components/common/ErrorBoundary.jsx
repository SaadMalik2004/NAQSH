import { Component } from "react";

// Catches unexpected rendering crashes so users never see a blank white page.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error("[NAQSH] render error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6 bg-[#FAF8F5]">
        <h1 className="text-3xl font-black text-slate-900">Something went wrong</h1>
        <p className="text-gray-500 max-w-md">An unexpected error occurred. Please refresh the page — your bag is safe.</p>
        <button
          onClick={() => window.location.assign("/")}
          className="bg-slate-900 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-black transition"
        >
          Back to home
        </button>
      </div>
    );
  }
}
