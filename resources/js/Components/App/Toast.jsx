// resources/js/Components/App/Toast.jsx
import { useEventBus } from "@/EventBus";
import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { v4 as uuidv4 } from "uuid";
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

const TOAST_CONFIG = {
  success: {
    gradient: "from-emerald-500 to-green-500",
    bg: "from-emerald-500/10 to-green-500/10",
    icon: CheckCircleIcon,
    iconColor: "text-emerald-400"
  },
  error: {
    gradient: "from-red-500 to-pink-500",
    bg: "from-red-500/10 to-pink-500/10",
    icon: ExclamationCircleIcon,
    iconColor: "text-red-400"
  },
  info: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "from-blue-500/10 to-cyan-500/10",
    icon: InformationCircleIcon,
    iconColor: "text-cyan-400"
  },
  warning: {
    gradient: "from-amber-500 to-orange-500",
    bg: "from-amber-500/10 to-orange-500/10",
    icon: ExclamationTriangleIcon,
    iconColor: "text-amber-400"
  },
  default: {
    gradient: "from-slate-500 to-slate-600",
    bg: "from-slate-500/10 to-slate-600/10",
    icon: InformationCircleIcon,
    iconColor: "text-slate-400"
  }
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

    if (!TOAST_CONFIG[type]) type = "default";

    if (!loading) {
      setToasts((prev) => prev.filter((t) => !t.loading));
    }

    const id = uuidv4();
    const toast = { id, message, type, loading, config: TOAST_CONFIG[type] };

    const addToastWithDelay = () => {
      setToasts((prev) => [...(prev || []), toast]);
      if (!loading) {
        setTimeout(() => {
          setToasts((prev) => (prev || []).filter((t) => t.id !== id));
        }, 5000);
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
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md pointer-events-none">
      <div className="flex flex-col gap-3 px-4">
        {toasts.map((toast) => {
          const Icon = toast.config.icon;
          
          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto 
                rounded-2xl backdrop-blur-xl
                bg-gradient-to-br from-slate-800/95 to-slate-900/95
                border border-slate-600/50
                shadow-2xl shadow-blue-500/20
                overflow-hidden
                transform transition-all duration-500
                hover:scale-[1.02] hover:shadow-cyan-500/20
                ${toast.loading ? 'animate-pulse' : ''}
              `}
            >
              {/* Gradient accent line */}
              <div className={`h-1 w-full bg-gradient-to-r ${toast.config.gradient}`}></div>
              
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`
                    p-2 rounded-xl backdrop-blur-sm
                    bg-gradient-to-br ${toast.config.bg}
                    border border-slate-600/50
                    flex-shrink-0
                  `}>
                    {toast.loading ? (
                      <div className="w-5 h-5">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <Icon className={`w-5 h-5 ${toast.config.iconColor}`} />
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-200 leading-relaxed">
                      {toast.message}
                    </span>
                  </div>

                  {/* Close button */}
                  {!toast.loading && (
                    <button
                      onClick={() => removeToastById(toast.id)}
                      className="
                        flex-shrink-0 p-1.5 rounded-lg
                        text-slate-400 hover:text-cyan-400
                        hover:bg-slate-700/50 transition-all duration-300
                        backdrop-blur-sm border border-transparent
                        hover:border-slate-600/50 hover:scale-110
                      "
                      type="button"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Progress bar for auto-dismiss */}
                {!toast.loading && (
                  <div className="mt-3 w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${toast.config.gradient} rounded-full transition-all duration-5000 ease-linear`}
                      style={{ 
                        width: '100%',
                        animation: 'shrink 5s linear forwards'
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {/* CSS for progress animation */}
              <style>{`
                @keyframes shrink {
                  from { width: 100%; }
                  to { width: 0%; }
                }
              `}</style>
            </div>
          );
        })}
      </div>
    </div>
  );
}