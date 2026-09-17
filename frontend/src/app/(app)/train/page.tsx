"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import PageTransition from "@/components/PageTransition";
import { useTodaySession } from "@/hooks/useSession";
import { useTrainingSheet } from "@/hooks/useTrainingSheet";

import RestAlertsModal from "./components/RestAlertsModal";
import SessionView from "./components/SessionView";
import WorkoutIntro from "./components/WorkoutIntro";
import { StyledDayCardSkeleton, StyledPage } from "./styles";
import { type AppView, todayDayOfWeek } from "./utils";

export default function TrainPage() {
  const router = useRouter();
  const [view, setView] = useState<AppView>("tabs");

  const sheet = useTrainingSheet();
  const todaySession = useTodaySession();
  const todayDow = todayDayOfWeek();
  const todaySheetDay = sheet.data?.days.find((d) => d.dayOfWeek === todayDow);

  // So redireciona sozinho quando a sessão já estava concluída ao carregar
  // (ex.: usuário abriu /train de novo depois de terminar). Enquanto
  // view === "session", é a própria SessionView que decide a hora de navegar
  // pra /session/completed — ela pode ter alertas de fim de sessão pra
  // mostrar antes, e essa navegação automática derrubava o componente (e o
  // alerta) no meio disso.
  useEffect(() => {
    if (
      view !== "session" &&
      (todaySession.data?.status === "completed" ||
        todaySession.data?.status === "skipped")
    ) {
      router.push("/session/completed");
    }
  }, [view, todaySession.data, router]);

  useEffect(() => {
    if (!sheet.data || todaySheetDay?.status !== "training") return;

    const status = todaySession.data?.status;
    if (status === "active") {
      setView("session");
    } else if (status === "partial") {
      setView("intro");
    }
  }, [sheet.data, todaySheetDay, todaySession.data]);

  useEffect(() => {
    if (view === "tabs" && sheet.data && todaySheetDay?.status !== "training") {
      router.replace("/home");
    }
  }, [view, sheet.data, todaySheetDay?.status, router]);

  if (view === "session") {
    return (
      <>
        <SessionView
          dayOfWeek={todayDow}
          sheetDay={todaySheetDay}
          onBack={() => router.push("/training-plan")}
        />
        <RestAlertsModal />
      </>
    );
  }

  if (view === "intro" && todaySheetDay) {
    return (
      <>
        <WorkoutIntro
          dayOfWeek={todayDow}
          sheetDay={todaySheetDay}
          onBack={() => router.push("/")}
          onStart={() => setView("session")}
        />
        <RestAlertsModal />
      </>
    );
  }

  return (
    <PageTransition>
      <StyledPage>
        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <StyledDayCardSkeleton />
          <StyledDayCardSkeleton />
        </div>
      </StyledPage>
    </PageTransition>
  );
}
