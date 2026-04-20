"use client";

import { createContext, useContext, type ReactNode } from 'react';
import type { V2Messages } from '../_messages';

const V2MessagesContext = createContext<V2Messages | null>(null);

export function V2MessagesProvider({
  messages,
  children,
}: {
  messages: V2Messages;
  children: ReactNode;
}) {
  return (
    <V2MessagesContext.Provider value={messages}>
      {children}
    </V2MessagesContext.Provider>
  );
}

export function useV2T(): V2Messages {
  const ctx = useContext(V2MessagesContext);
  if (!ctx) throw new Error('useV2T must be used within V2MessagesProvider');
  return ctx;
}
