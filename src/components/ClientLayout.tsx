"use client";

import { ToastProvider } from "@/components/ui/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { WebSocketInitializer } from "@/components/WebSocketInitializer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WebSocketInitializer />
        {children}
      </ToastProvider>
    </ErrorBoundary>
  );
}