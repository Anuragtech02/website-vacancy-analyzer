"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type BannerVariant = "error" | "success" | "info";

interface InlineBannerProps {
  message: string;
  variant?: BannerVariant;
  onDismiss: () => void;
  className?: string;
}

const variantStyle: Record<BannerVariant, string> = {
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
};

const dismissStyle: Record<BannerVariant, string> = {
  error: "text-red-700 hover:text-red-900",
  success: "text-emerald-700 hover:text-emerald-900",
  info: "text-blue-700 hover:text-blue-900",
};

export function InlineBanner({ message, variant = "error", onDismiss, className }: InlineBannerProps) {
  const t = useTranslations("common");

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "border rounded-xl p-4 flex items-start gap-3 shadow-sm",
        variantStyle[variant],
        className
      )}
    >
      <div className="flex-1 text-sm">{message}</div>
      <button
        type="button"
        onClick={onDismiss}
        className={cn("text-xs font-semibold underline", dismissStyle[variant])}
      >
        {t("dismiss")}
      </button>
    </div>
  );
}
