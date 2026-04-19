"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { NotificationProvider } from "@/context/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { WebSocketInitializer } from "@/components/WebSocketInitializer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ToastProvider>
          <WebSocketInitializer />
          {children}
        </ToastProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}