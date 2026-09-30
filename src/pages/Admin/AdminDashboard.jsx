import { useState } from "react";
import { LayoutDashboard, Package, Shirt, MessageSquare } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminMessages from "./AdminMessages";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "products", label: "Products", icon: Shirt },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

export default function AdminDashboard() {
  useDocumentTitle("Admin Dashboard");
  const [tab, setTab] = useState("orders");

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-6">
        <p className="uppercase tracking-[4px] text-xs font-bold text-blue-600 mb-1 flex items-center gap-2"><LayoutDashboard size={14} /> ADMIN</p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">Store Dashboard</h1>
        <div className="flex gap-2 mb-8 overflow-x-auto" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${tab === id ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        {tab === "orders" && <AdminOrders />}
        {tab === "products" && <AdminProducts />}
        {tab === "messages" && <AdminMessages />}
      </div>
    </div>
  );
}
