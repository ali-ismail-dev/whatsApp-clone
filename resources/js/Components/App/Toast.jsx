// resources/js/Components/App/Toast.jsx
import { useEventBus } from "@/EventBus";
import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { v4 as uuidv4 } from "uuid";

const TOAST_CLASSES = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
  warning: "alert-warning",
  default: "alert-info",
};

export default function Toast() {
  const { flash = {} } = usePage().props ?? {};
  const { on } = useEventBus();

  const [toasts, setToasts] = useState([]);

  const addToast = (payload, explicitType = "default") => {
    let message = "";
    let type = explicitType || "default";
    let loading = false;
    let delay = 0;

    if (typeof payload === "string") {
      message = payload;
    } else if (payload && typeof payload === "object") {
      message = payload.message ?? payload.msg ?? JSON.stringify(payload);
      type = payload.type ?? explicitType ?? (payload.loading ? "info" : "default");
      loading = !!payload.loading;
      delay = payload.delay || 0;
    } else {
      message = String(payload);
    }

    if (!TOAST_CLASSES[type]) type = "default";

    if (!loading) {
      setToasts((prev) => prev.filter((t) => !t.loading));
    }

    const id = uuidv4();
    const toast = { id, message, type, loading };

    const addToastWithDelay = () => {
      setToasts((prev) => [...(prev || []), toast]);
      if (!loading) {
        setTimeout(() => {
          setToasts((prev) => (prev || []).filter((t) => t.id !== id));
        }, 5000); // increase duration slightly for readability
      }
    };

    if (delay > 0) {
      setTimeout(addToastWithDelay, delay);
    } else {
      addToastWithDelay();
    }

    return id;
  };

  const removeToastById = (id) => {
    setToasts((prev) => (prev || []).filter((t) => t.id !== id));
  };

  useEffect(() => {
    ["success", "error", "info", "warning"].forEach((k) => {
      if (flash[k]) addToast(flash[k], k);
    });
  }, [flash]);

  useEffect(() => {
    const off = on("toast.show", (payload, type = undefined) => {
      addToast(payload, type);
    });
    return () => off();
  }, [on]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-sm pointer-events-none">
      <div className="flex flex-col gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto alert ${TOAST_CLASSES[toast.type]} shadow-lg rounded-lg`}
            style={{ minHeight: "50px", maxWidth: "300px" }} // slightly shorter and narrow
          >
            <div className="flex items-center justify-center gap-3 h-full">
              {toast.loading && (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}

              <span className="text-sm">{toast.message}</span>

              <button
                onClick={() => removeToastById(toast.id)}
                className="ml-2 text-xl font-bold opacity-90 hover:opacity-100 w-7 h-7 flex items-center justify-center"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
