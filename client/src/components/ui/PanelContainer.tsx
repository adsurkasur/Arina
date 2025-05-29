import { cn } from "@/lib/theme";

// Panel container for right side panels (tools, history, etc.)
export const PanelContainer: React.FC<{ children: React.ReactNode; onClose?: () => void; title?: string; fixed?: boolean }> = ({ children, onClose, title, fixed }) => (
  <div
    className={cn(
      fixed
        ? "fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-200 transition-transform duration-300 ease-in-out animate-featurepanel-in flex flex-col min-w-[320px] z-[200]"
        : "h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200 transition-transform duration-300 ease-in-out animate-featurepanel-in flex flex-col min-w-[320px]"
    )}
    style={fixed ? {} : { position: "relative", zIndex: "auto" }}
  >
    <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
      <h2 className="text-xl font-semibold text-primary">{title}</h2>
      {onClose && (
        <button
          className="text-gray-500 hover:text-gray-800 transition-colors"
          onClick={onClose}
          aria-label="Close panel"
        >
          ✕
        </button>
      )}
    </div>
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      {children}
    </div>
  </div>
);