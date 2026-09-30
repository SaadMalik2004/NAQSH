import toast from "react-hot-toast";
import { Mail, Trash2 } from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { ListSkeleton } from "../../components/common/Skeleton";
import { useAsyncData } from "../../hooks/useAsyncData";
import { deleteMessage, fetchMessages, markMessageRead } from "../../services/adminService";
import { formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";

export default function AdminMessages() {
  const { data, loading, error, reload } = useAsyncData(() => fetchMessages(), []);

  const run = async (fn, ok) => {
    try {
      await fn();
      if (ok) toast.success(ok);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <ListSkeleton rows={3} />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;
  if (data.length === 0) return <EmptyState icon={Mail} title="No messages" message="Contact form messages will appear here." />;

  return (
    <ul className="space-y-3">
      {data.map((m) => (
        <li key={m.id} className={`bg-white rounded-2xl border p-5 ${m.is_read ? "border-gray-100" : "border-blue-200"}`}>
          <div className="flex justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 text-sm">{m.subject}</p>
              <p className="text-xs text-gray-500">{m.name} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a> · {formatDateTime(m.created_at)}</p>
            </div>
            <div className="flex gap-3 text-xs items-start">
              <button onClick={() => run(() => markMessageRead(m.id, !m.is_read))} className="font-semibold text-blue-600 hover:underline">{m.is_read ? "Mark unread" : "Mark read"}</button>
              <button aria-label="Delete message" onClick={() => window.confirm("Delete this message?") && run(() => deleteMessage(m.id), "Message deleted")} className="text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3 whitespace-pre-line break-words">{m.message}</p>
        </li>
      ))}
    </ul>
  );
}
