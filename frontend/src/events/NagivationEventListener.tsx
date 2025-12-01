import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function NavigationEventListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      const { to, toast: toastObj } = e.detail || {};

      if (toastObj?.message) {
        toast.error(toastObj.message);
      }

      if (to) navigate(to);
    };

    window.addEventListener("app:navigate", handler);
    return () => window.removeEventListener("app:navigate", handler);
  }, [navigate]);

  return null;
}
