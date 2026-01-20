"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

export default function AdminResetContent() {
  const searchParams = useSearchParams();
  const secret = searchParams.get("secret");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [deletedCount, setDeletedCount] = useState(0);
  const [identifiers, setIdentifiers] = useState("");
  const [localStorageCleared, setLocalStorageCleared] = useState(false);

  const handleReset = async () => {
    if (!secret) {
      setStatus("error");
      setMessage("Missing secret key in URL");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // Call the API endpoint
      const response = await fetch(`/api/admin/reset-limit?secret=${encodeURIComponent(secret)}`);
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to reset limit");
        return;
      }

      // Success - update state with response data
      setStatus("success");
      setMessage(data.message || "Successfully reset usage limit");
      setDeletedCount(data.deletedLeads || 0);
      setIdentifiers(data.identifiers || "");

    } catch (error) {
      setStatus("error");
      setMessage("Network error: Failed to connect to server");
      console.error("Reset error:", error);
    }
  };

  const handleClearLocalStorage = () => {
    try {
      localStorage.removeItem("vacancy_usage_count");
      setLocalStorageCleared(true);
      setTimeout(() => setLocalStorageCleared(false), 3000);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  };

  // Auto-run reset on page load if secret is present
  useEffect(() => {
    if (secret && status === "idle") {
      handleReset();
    }
  }, [secret]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border border-border rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin: Reset Usage Limit
          </h1>
          <p className="text-muted-foreground">
            Reset database records and clear browser storage
          </p>
        </div>

        {/* Status Display */}
        <div className="mb-8">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-3 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-blue-900 font-medium">Resetting database records...</p>
            </div>
          )}

          {status === "success" && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-900 font-semibold mb-2">{message}</p>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>✓ Database records deleted: <strong>{deletedCount}</strong></p>
                    {identifiers && <p>✓ Identifiers: <strong>{identifiers}</strong></p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-900 font-semibold mb-1">Error</p>
                  <p className="text-sm text-red-800">{message}</p>
                </div>
              </div>
            </div>
          )}

          {status === "idle" && !secret && (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-900 font-semibold mb-1">Missing Secret Key</p>
                  <p className="text-sm text-yellow-800">
                    Please add <code className="bg-yellow-100 px-1 rounded">?secret=YOUR_KEY</code> to the URL
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div>
            <Button
              onClick={handleReset}
              disabled={status === "loading" || !secret}
              className="w-full"
              size="lg"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Resetting Database...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset Database Records
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Deletes all leads matching your IP address from the database
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">And</span>
            </div>
          </div>

          <div>
            <Button
              onClick={handleClearLocalStorage}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Clear Browser Storage
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Removes usage count from your browser's localStorage
            </p>

            {localStorageCleared && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 text-center font-medium">
                  ✓ Browser storage cleared successfully!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-2">How to use:</h3>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>First, click "Reset Database Records" to clear server-side usage tracking</li>
            <li>Then, click "Clear Browser Storage" to reset client-side usage count</li>
            <li>Refresh the homepage to verify your usage limit has been reset</li>
          </ol>
        </div>

        {/* Usage Info */}
        <div className="mt-6 p-4 bg-accent/10 border border-accent rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Current localStorage value:</strong>{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
              vacancy_usage_count = {typeof window !== 'undefined' ? localStorage.getItem("vacancy_usage_count") || "0" : "0"}
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
