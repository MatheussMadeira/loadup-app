"use client";

import { CheckCircle2, Flame, Hand, Trophy } from "lucide-react";

import StatCard from "@/components/StatCard";
import { strings } from "@/constants/strings";
import { ProgressionSummary } from "@/types";
import { useRouter } from "next/navigation";
import { useUnreadCount } from "@/hooks/useNotification";
import {
  StyledAvatar,
  StyledAvatarRow,
  StyledGreetingCol,
  StyledGreetingName,
  StyledGreetingSmall,
  StyledHeader,
  StyledHeaderActions,
  StyledHeaderTopRow,
  StyledIconButton,
  StyledStatRow,
} from "./styles";

interface HomeHeaderProps {
  userName: string;
  summary: ProgressionSummary | undefined;
  weeklyCompleted: number;
  onBellClick: () => void;
  onLogout: () => void;
}

export default function HomeHeader({
  userName,
  summary,
  weeklyCompleted,
  onBellClick,
  onLogout,
}: HomeHeaderProps) {
  const router = useRouter();
  const { data: unreadData } = useUnreadCount();
  const notifCount = unreadData?.count ?? 0;
  return (
    <StyledHeader>
      <StyledHeaderTopRow>
        <StyledAvatarRow>
          <StyledAvatar>{userName[0]?.toUpperCase() ?? "A"}</StyledAvatar>
          <StyledGreetingCol>
            <StyledGreetingSmall>Olá,</StyledGreetingSmall>
            <StyledGreetingName>{userName} </StyledGreetingName>
          </StyledGreetingCol>
        </StyledAvatarRow>

        <StyledHeaderActions>
          <StyledIconButton
            aria-label={strings.common.ariaNotifications}
            onClick={onBellClick}
            style={{ position: "relative" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            {notifCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#CF3A3A",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              >
                {notifCount > 9 ? "9+" : notifCount}
              </div>
            )}
          </StyledIconButton>
          <StyledIconButton
            aria-label={strings.common.ariaLogout}
            onClick={onLogout}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </StyledIconButton>
        </StyledHeaderActions>
      </StyledHeaderTopRow>

      <StyledStatRow>
        <StatCard
          icon={<Flame size={15} />}
          label={strings.home.statStreak}
          value={summary?.workoutStreak?.currentDays ?? 0}
          unit={strings.home.statDays}
        />
        <StatCard
          icon={<CheckCircle2 size={15} />}
          label={strings.home.statWeek}
          value={weeklyCompleted}
          unit={strings.home.statWeekUnit}
        />
        <StatCard
          icon={<Trophy size={15} />}
          label={strings.home.statTotal}
          value={summary?.totalSessionsRecorded ?? 0}
          unit={strings.home.statSessions}
        />
      </StyledStatRow>
    </StyledHeader>
  );
}
