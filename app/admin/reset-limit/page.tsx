"use client";

import { Suspense } from "react";
import AdminResetContent from "./AdminResetContent";

export default function AdminResetLimitPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin: Reset Usage Limit
            </h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <AdminResetContent />
    </Suspense>
  );
}
