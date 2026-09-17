"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import BottomNavBar from "@/components/BottomNavBar";
import RestTimerWidget from "@/components/RestTimerWidget";
import WorkoutTimerWidget from "@/components/WorkoutTimerWidget";
import { RestAlertsProvider } from "@/app/(app)/train/context/RestAlertsContext";
import { RestTimerProvider } from "@/context/RestTimerContext";
import { tokenStorage } from "@/lib/tokenStorage";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!tokenStorage.get()) {
      router.replace("/login");
    }
  }, [router]);

  // O container de rolagem vive no layout e sobrevive a navegacao, entao ele
  // manteria o scroll da tela anterior ao trocar de rota (o browser so faz
  // esse reset sozinho quando quem rola e o documento).
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  if (!mounted || !tokenStorage.get()) {
    return null;
  }

  return (
    <RestAlertsProvider>
      <RestTimerProvider>
        <StyledWrapper>
          <StyledContent id="app-scroll" ref={scrollRef}>
            {children}
          </StyledContent>
          <RestTimerWidget />
          <WorkoutTimerWidget />
          <BottomNavBar />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1E293B",
                color: "#F8FAFC",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
              },
            }}
          />
        </StyledWrapper>
      </RestTimerProvider>
    </RestAlertsProvider>
  );
}

// App shell: a altura e travada no viewport e o unico elemento que rola e o
// StyledContent. Isso e o que impede o documento de rolar no iOS — que era a
// origem do bottom nav "descolando" da base da tela.
const StyledWrapper = styled.div`
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  scroll-behavior: smooth;
  padding-top: calc(var(--safe-top) + 10px);
  /* Espaco pro conteudo rolar por baixo da barra inferior sem ficar coberto. */
  padding-bottom: var(--bottom-nav-height);
`;
