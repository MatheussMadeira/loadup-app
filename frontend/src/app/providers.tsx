"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import React from "react";

import { useServiceWorker } from "@/hooks/useServiceWorker";
import { queryClient } from "@/lib/queryClient";
import {
  QUERY_CACHE_BUSTER,
  QUERY_CACHE_MAX_AGE,
  queryPersister,
  shouldPersistQuery,
} from "@/lib/queryPersister";
import { GlobalStyles } from "@/styles/globalStyles";
import { ThemeProvider } from "@/styles/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  useServiceWorker();

  return (
    // O cache do React Query vive no IndexedDB entre sessoes: o app abre com
    // os dados do ultimo uso em vez de esqueleto, e continua legivel sem rede.
    // A revalidacao acontece normalmente por cima disso assim que houver rede.
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: QUERY_CACHE_MAX_AGE,
        buster: QUERY_CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      <ThemeProvider>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
