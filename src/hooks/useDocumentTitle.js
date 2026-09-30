import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | NAQSH` : "NAQSH | Wear Your Identity";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
