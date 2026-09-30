import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="bg-red-600 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-2" role="alert">
      <WifiOff size={16} /> You're offline. Some features won't work until your connection is back.
    </div>
  );
}
