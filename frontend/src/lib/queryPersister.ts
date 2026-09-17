"use client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Query } from "@tanstack/react-query";
import { del, get, set } from "idb-keyval";

const CACHE_KEY = "loadup-query-cache";

/**
 * Bump manual: qualquer mudanca no formato dos dados vindos da API deve
 * incrementar isso, senao um cache antigo pode ser reidratado com um shape que
 * a UI nao entende mais.
 */
export const QUERY_CACHE_BUSTER = "v1";

/**
 * Quanto tempo um cache em disco ainda vale a pena restaurar. Mais longo do que
 * o staleTime de proposito: o objetivo aqui nao e evitar refetch (o React Query
 * revalida assim que ha rede), e sim ter o que mostrar quando *nao* ha rede —
 * academia em subsolo, avião, etc.
 */
export const QUERY_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Buscas sao transitorias e crescem sem limite conforme o usuario digita.
 * Persistir isso so inflaria o cache em disco sem nenhum ganho offline.
 */
const TRANSIENT_KEYS = ["exerciseSearch", "users"];

export function shouldPersistQuery(query: Query): boolean {
  if (query.state.status !== "success") return false;

  const root = query.queryKey[0];
  if (typeof root === "string" && TRANSIENT_KEYS.includes(root)) return false;

  return true;
}

const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

// O IndexedDB pode simplesmente nao estar disponivel (Safari em navegacao
// privada, storage cheio, politicas de site). Nesse caso o app tem que seguir
// funcionando normalmente, so sem cache entre sessoes — por isso tudo aqui
// falha em silencio em vez de propagar.
const indexedDbStorage = {
  getItem: async (key: string) => {
    try {
      return (await get<string>(key)) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await set(key, value);
    } catch {}
  },
  removeItem: async (key: string) => {
    try {
      await del(key);
    } catch {}
  },
};

export const queryPersister = createAsyncStoragePersister({
  // Em SSR nao existe IndexedDB; o no-op deixa o provider montar sem
  // condicional e o cache real assume assim que hidrata no cliente.
  storage: typeof window === "undefined" ? noopStorage : indexedDbStorage,
  key: CACHE_KEY,
  throttleTime: 1000,
});

/** Usado no logout — os dados em disco sao de um usuario que saiu. */
export async function clearPersistedQueryCache(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await del(CACHE_KEY);
  } catch {
    // Cache em disco indisponivel (modo privado, storage cheio): o
    // queryClient.clear() em memoria ja cobre o essencial.
  }
}
