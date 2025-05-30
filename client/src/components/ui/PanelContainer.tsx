import { cn } from "@/lib/theme";

// Panel container for right side panels (tools, history, etc.)
export const PanelContainer: React.FC<{ children: React.ReactNode; onClose?: () => void; title?: string; fixed?: boolean }> = ({ children, onClose, title, fixed }) => (
  <div
    className={cn(
      fixed
        ? "fixed top-0 right-0 w-full max-w-md h-full bg-card dark:bg-card shadow-2xl border-l border-border dark:border-border transition-transform duration-300 ease-in-out animate-featurepanel-in flex flex-col min-w-[320px] z-[200]"
        : "h-full w-full max-w-md bg-card dark:bg-card shadow-2xl border-l border-border dark:border-border transition-transform duration-300 ease-in-out animate-featurepanel-in flex flex-col min-w-[320px]"
    )}
    style={fixed ? {} : { position: "relative", zIndex: "auto" }}
  >
    <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-border dark:border-border">
      <h2 className="text-xl font-semibold text-primary dark:text-primary">{title}</h2>
      {onClose && (
        <button
          className="text-foreground/60 hover:text-foreground transition-colors"
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