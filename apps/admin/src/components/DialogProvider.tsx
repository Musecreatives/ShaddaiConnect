'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

interface ConfirmOptions {
  title?: string;
  danger?: boolean;
  confirmLabel?: string;
}

type ToastKind = 'success' | 'error';

interface DialogContextValue {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  toast: (message: string, kind?: ToastKind) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

/** Promise-based replacement for window.confirm(), styled to match the admin theme. */
export function useConfirm() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useConfirm must be used within DialogProvider');
  return ctx.confirm;
}

/** Replacement for window.alert() — shows a themed, auto-dismissing toast instead. */
export function useToast() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useToast must be used within DialogProvider');
  return ctx.toast;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<{ message: string; options?: ConfirmOptions } | null>(null);
  const resolverRef = useRef<(value: boolean) => void>(undefined);
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: ToastKind }[]>([]);
  const nextToastId = useRef(0);

  const confirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setPending({ message, options });
    });
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = 'error') => {
    const id = ++nextToastId.current;
    setToasts((current) => [...current, { id, message, kind }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 5000);
  }, []);

  const settle = (result: boolean) => {
    resolverRef.current?.(result);
    setPending(null);
  };

  return (
    <DialogContext.Provider value={{ confirm, toast }}>
      {children}

      {pending && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          onClick={() => settle(false)}
        >
          <div
            className="w-full max-w-sm rounded-card border border-line bg-surface p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {pending.options?.title && (
              <h2 className="font-display text-base font-bold text-ink">{pending.options.title}</h2>
            )}
            <p className="mt-1 text-sm text-muted">{pending.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => settle(false)}
                className="rounded-btn border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-blue"
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => settle(true)}
                className={`rounded-btn px-4 py-2 text-sm font-bold text-white transition-colors ${
                  pending.options?.danger
                    ? 'bg-danger hover:bg-danger/90'
                    : 'bg-brand-blue hover:bg-brand-blue-deep'
                }`}
              >
                {pending.options?.confirmLabel ?? (pending.options?.danger ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-btn border px-4 py-2.5 text-sm font-semibold shadow-lg ${
              t.kind === 'error'
                ? 'border-danger/30 bg-danger-tint text-danger'
                : 'border-success/30 bg-success-tint text-success'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </DialogContext.Provider>
  );
}
