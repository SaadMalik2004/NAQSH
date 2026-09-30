import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="bg-[#FAF8F5] min-h-[80vh] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
        <Link to="/" className="block text-center mb-6">
          <span className="text-2xl font-black tracking-[4px] text-slate-900">NAQSH</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 text-center">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 text-center mt-1 mb-6">{subtitle}</p>}
        {children}
        {footer && <div className="text-center text-xs text-gray-500 mt-6">{footer}</div>}
      </div>
    </div>
  );
}
