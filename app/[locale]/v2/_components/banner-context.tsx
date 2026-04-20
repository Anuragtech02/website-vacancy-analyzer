"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type BannerVariant } from "./inline-banner";

export interface BannerState {
  message: string;
  variant: BannerVariant;
}

interface BannerContextValue {
  setBanner: (banner: BannerState | null) => void;
}

const BannerContext = createContext<BannerContextValue | null>(null);

export function BannerProvider({
  children,
  setBanner,
}: {
  children: ReactNode;
  setBanner: (b: BannerState | null) => void;
}) {
  return (
    <BannerContext.Provider value={{ setBanner }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner(): (banner: BannerState | null) => void {
  const ctx = useContext(BannerContext);
  if (!ctx) {
    // Silently no-op if no provider — keeps components working in isolation
    return () => {};
  }
  return ctx.setBanner;
}
