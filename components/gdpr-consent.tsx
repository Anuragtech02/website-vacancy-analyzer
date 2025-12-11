"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";

export function GDPRConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("vacancy-analyzer-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("vacancy-analyzer-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Your Privacy Matters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            We use cookies and process your data to provide our vacancy analysis and optimization services.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li><strong>Vacancy Text:</strong> Analyzed by AI to generate your report. Not shared with third parties other than our AI provider.</li>
            <li><strong>Email Address:</strong> Used only to send you the optimized vacancy and related service updates.</li>
          </ul>
          <p className="pt-2">
            By clicking "Accept", you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-2">
          <Button onClick={handleAccept} className="w-full sm:w-auto">
            Accept & Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
