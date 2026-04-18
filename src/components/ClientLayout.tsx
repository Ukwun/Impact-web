"use client";

import { ToastProvider } from "@/components/ui/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { WebSocketInitializer } from "@/components/WebSocketInitializer";
import "@/lib/fetchInterceptor"; // Global fetch interceptor for API calls

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