import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
      <h1 className="text-8xl font-black text-slate-900">404</h1>
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-gray-500 max-w-sm text-sm">Sorry, the page you're looking for doesn't exist or has moved.</p>
      <div className="flex gap-3 mt-2">
        <Link to="/" className="bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-black transition text-sm font-semibold">Go home</Link>
        <Link to="/shop" className="border-2 border-slate-900 px-6 py-3 rounded-full hover:bg-slate-900 hover:text-white transition text-sm font-semibold">Browse shop</Link>
      </div>
    </div>
  );
}
