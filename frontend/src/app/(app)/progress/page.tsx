"use client";

import React, { useEffect, useMemo, useState, KeyboardEvent } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Flame, TrendingUp, Dumbbell, Trophy } from "lucide-react";
import FriendsTab from "./components/FriendsTab";
import EmptyState from "@/components/EmptyState";
import PageTransition from "@/components/PageTransition";
import { strings } from "@/constants/strings";
import { useMonthlyCalendar } from "@/hooks/useCalendar";
import {
  useProgressionChart,
  useProgressionSummary,
} from "@/hooks/useProgression";
import { useTrainingSheet } from "@/hooks/useTrainingSheet";
import { useAppTheme } from "@/styles/ThemeProvider";
import { ColorTheme, colorThemeDefinitions } from "@/styles/theme";
import { MuscleGroup } from "@/types";
import { RotateCcw } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

import MonthlyHistory from "./components/MonthlyHistory";
import ProgressionChart from "./components/ProgressionChart";
import {
  StyledBody,
  StyledCard,
  StyledChipScroll,
  StyledExerciseChip,
  StyledHeader,
  StyledHeaderSkeleton,
  StyledHint,
  StyledImprovementBadge,
  StyledMuscleBar,
  StyledMuscleBarWrap,
  StyledMuscleCount,
  StyledMuscleList,
  StyledMuscleName,
  StyledMuscleRow,
  StyledPage,
  StyledPillLabel,
  StyledPillValue,
  StyledPrBanner,
  StyledPrText,
  StyledSectionCard,
  StyledSectionHeading,
  StyledSectionHeader,
  StyledSectionIcon,
  StyledSectionLabel,
  StyledSectionTitle,
  StyledSkeletonCard,
  StyledTabBar,
  StyledTabButton,
  StyledTitle,
  StyledSubtitle,
  StyledProfileEmail,
  StyledProfileInfo,
  StyledProfileName,
  StyledProfileRow,
  StyledNameInput,
  StyledAvatarEdit,
  StyledAvatarWrap,
  StyledColorSwatch,
  StyledColorSwatchRow,
  StyledLanguageRow,
  StyledLanguageValue,
  StyledPreferenceControl,
  StyledPreferenceInfo,
  StyledPreferenceLabel,
  StyledPreferenceRow,
  StyledSignOutButton,
  StyledSwatchCheck,
  StyledSwatchCircle,
  StyledSwatchLabel,
  StyledToggleGroup,
  StyledToggleOption,
  StyledAppearanceRow,
  StyledControlButton,
  StyledControlValue,
  StyledHistoryRow,
  StyledHistoryIcon,
  StyledHistoryInfo,
  StyledHistoryLabel,
  StyledHistorySub,
  StyledHistoryChevron,
  StyledTabIndicator,
} from "./styles";
import { formatShortDate, getISOWeekKey } from "./utils";
import { useSnapshots } from "@/hooks/useTrainingSheet";
import { useRouter } from "next/navigation";
import SlideTab from "@/components/SlideTab";

export default function ProgressPage() {
  const { theme, mode, colorKey, setColorTheme, toggleMode } = useAppTheme();
  const [activeTab, setActiveTab] = useState<
    "progress" | "friends" | "settings"
  >("progress");
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const logout = useLogout();
  const [userName, setUserName] = useState<string>(
    () => authService.getName() || "Atleta",
  );
  const userEmail = authService.getEmail?.() || "";
  const [editingName, setEditingName] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [language, setLanguage] = useState("Português");
  const snapshots = useSnapshots();
  const snapshotCount = snapshots.data?.length ?? 0;
  const themeOptions = Object.values(colorThemeDefinitions) as Array<{
    id: ColorTheme;
    name: string;
    primary: string;
    primaryDark: string;
  }>;

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setEditingName(false);
    }
  };

  const handleRestChange = (value: number) => {
    setRestSeconds((current) => Math.max(10, current + value));
  };

  const handleWeightToggle = (unit: "kg" | "lb") => {
    setWeightUnit(unit);
  };

  const handleLanguageClick = () => {
    setLanguage((prev) => (prev === "Português" ? "English" : "Português"));
  };
  const handleNameBlur = async () => {
    setEditingName(false);
    if (userName.trim()) {
      await userService.updateProfile({ name: userName.trim() });
    }
  };
  const now = new Date();
  const summary = useProgressionSummary();
  const chart = useProgressionChart(selectedExercise ?? "");
  const sheet = useTrainingSheet();
  const monthly = useMonthlyCalendar(now.getFullYear(), now.getMonth() + 1);
  const prevMonthYear =
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevMonthly = useMonthlyCalendar(prevMonthYear, prevMonth);

  const exerciseNames = useMemo<string[]>(() => {
    const topNames = (summary.data?.topExercises ?? []).map((e) => e.name);
    if (topNames.length > 0) return topNames;
    if (!sheet.data) return [];
    const set = new Set<string>();
    sheet.data.days.forEach((day) => {
      if (day.status === "training")
        day.exercises.forEach((ex) => set.add(ex.name));
    });
    return Array.from(set);
  }, [summary.data, sheet.data]);

  useEffect(() => {
    if (exerciseNames.length > 0 && selectedExercise === null)
      setSelectedExercise(exerciseNames[0]);
  }, [exerciseNames, selectedExercise]);

  const weeklyActivity = useMemo(() => {
    const allDays = [
      ...(prevMonthly.data?.days ?? []),
      ...(monthly.data?.days ?? []),
    ].filter((d) => d.sessionStatus === "recorded");
    const weekMap = new Map<string, number>();
    allDays.forEach((day) => {
      const date = new Date(`${day.date.substring(0, 10)}T12:00:00`);
      const key = getISOWeekKey(date);
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
    });
    return Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([, count], i) => ({ label: `S${i + 1}`, count }));
  }, [monthly.data, prevMonthly.data]);

  const muscleSeries = useMemo(() => {
    if (!sheet.data) return [];
    const map = new Map<string, number>();
    sheet.data.days.forEach((day) => {
      if (day.status === "training")
        day.exercises.forEach((ex) => {
          map.set(
            ex.muscleGroup,
            (map.get(ex.muscleGroup) ?? 0) + ex.series.length,
          );
        });
    });
    const max = Math.max(...Array.from(map.values()), 1);
    return Array.from(map.entries())
      .map(([group, count]) => ({
        group: group as MuscleGroup,
        count,
        pct: (count / max) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [sheet.data]);
  const tabIndex =
    activeTab === "progress" ? 0 : activeTab === "friends" ? 1 : 2;

  const prData = useMemo(() => {
    const data = chart.data?.chartData;
    if (!data || data.length === 0) return null;
    const maxWeight = chart.data!.statistics.maxWeight;
    const prPoint = data.reduce(
      (best, p) => (p.weight >= best.weight ? p : best),
      data[0],
    );
    const firstWeight = data[0].weight;
    const improvement =
      firstWeight > 0 ? ((maxWeight - firstWeight) / firstWeight) * 100 : 0;
    return {
      weight: maxWeight,
      reps: prPoint.reps,
      date: formatShortDate(prPoint.date),
      improvement,
    };
  }, [chart.data]);

  if (summary.isLoading && sheet.isLoading) {
    return (
      <PageTransition>
        <StyledPage>
          <StyledHeaderSkeleton />
          <StyledBody>
            <StyledSkeletonCard />
            <StyledSkeletonCard style={{ height: 220 }} />
          </StyledBody>
        </StyledPage>
      </PageTransition>
    );
  }

  const hasNoData =
    !summary.isLoading &&
    !summary.error &&
    summary.data?.totalSessionsRecorded === 0;

  return (
    <PageTransition>
      <StyledPage>
        <StyledHeader>
          <StyledSubtitle></StyledSubtitle>
          <StyledTitle>{strings.progression.titleMain}</StyledTitle>
          <StyledTabBar>
            <StyledTabButton
              $active={activeTab === "progress"}
              onClick={() => setActiveTab("progress")}
            >
              Progresso
            </StyledTabButton>
            <StyledTabButton
              $active={activeTab === "friends"}
              onClick={() => setActiveTab("friends")}
            >
              Amigos
            </StyledTabButton>
            <StyledTabButton
              $active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
            >
              Configurações
            </StyledTabButton>
            <StyledTabIndicator
              $index={
                activeTab === "progress" ? 0 : activeTab === "friends" ? 1 : 2
              }
              $total={3}
            />
          </StyledTabBar>
        </StyledHeader>

        <StyledBody>
          <SlideTab
            activeIndex={
              activeTab === "progress" ? 0 : activeTab === "friends" ? 1 : 2
            }
          >
            {activeTab === "progress" ? (
              <>
                {hasNoData && (
                  <EmptyState
                    title={strings.progression.noDataTitle}
                    description={strings.progression.noDataSubtitle}
                  />
                )}

                {weeklyActivity.length > 0 && (
                  <StyledCard>
                    <StyledSectionHeader>
                      <StyledSectionIcon>
                        <Flame size={16} />
                      </StyledSectionIcon>
                      <StyledSectionTitle>
                        {strings.progression.weeklyActivityTitle}
                      </StyledSectionTitle>
                    </StyledSectionHeader>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart
                        data={weeklyActivity}
                        margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={theme.colors.outlineVariant}
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 10,
                            fill: theme.colors.onSurfaceMuted,
                          }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: theme.colors.onSurfaceMuted,
                          }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            fontSize: "12px",
                            border: `1px solid ${theme.colors.outlineVariant}`,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.20)",
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.onSurface,
                          }}
                          labelStyle={{ color: theme.colors.onSurfaceMuted }}
                          itemStyle={{ color: theme.colors.onSurface }}
                          cursor={{
                            fill: theme.colors.outlineVariant,
                            opacity: 0.4,
                          }}
                          formatter={(v: number) => [v, "Treinos"]}
                        />
                        <Bar
                          dataKey="count"
                          fill={theme.colors.primary}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </StyledCard>
                )}

                <MonthlyHistory />

                <StyledCard>
                  <StyledSectionHeader>
                    <StyledSectionIcon>
                      <TrendingUp size={16} />
                    </StyledSectionIcon>
                    <StyledSectionTitle>
                      {strings.progression.chargeProgressionTitle}
                    </StyledSectionTitle>
                  </StyledSectionHeader>
                  {exerciseNames.length === 0 ? (
                    <StyledHint>
                      {strings.progression.noExercisesWithData}
                    </StyledHint>
                  ) : (
                    <StyledChipScroll>
                      {exerciseNames.map((name) => (
                        <StyledExerciseChip
                          key={name}
                          $selected={selectedExercise === name}
                          onClick={() => setSelectedExercise(name)}
                        >
                          {name}
                        </StyledExerciseChip>
                      ))}
                    </StyledChipScroll>
                  )}
                  {prData && (
                    <StyledPrBanner>
                      <StyledPrText>
                        <Trophy size={14} style={{ flexShrink: 0 }} />{" "}
                        {strings.progression.prLabel(
                          prData.weight,
                          prData.reps,
                          prData.date,
                        )}
                      </StyledPrText>
                      {prData.improvement > 0 && (
                        <StyledImprovementBadge>
                          {strings.progression.improvement(prData.improvement)}
                        </StyledImprovementBadge>
                      )}
                    </StyledPrBanner>
                  )}
                  {selectedExercise === null ? (
                    <StyledHint>
                      {strings.progression.selectExerciseHint}
                    </StyledHint>
                  ) : chart.isLoading ? (
                    <StyledSkeletonCard style={{ height: 180, margin: 0 }} />
                  ) : chart.error ? (
                    <StyledHint>
                      {strings.progression.noDataSubtitle}
                    </StyledHint>
                  ) : chart.data ? (
                    <ProgressionChart
                      data={chart.data}
                      primaryColor={theme.colors.primary}
                      primaryContainerColor={theme.colors.primaryContainer}
                      onSurfaceMuted={theme.colors.onSurfaceMuted}
                      surfaceColor={theme.colors.surface}
                      onSurfaceColor={theme.colors.onSurface}
                      outlineVariant={theme.colors.outlineVariant}
                    />
                  ) : null}
                </StyledCard>

                {muscleSeries.length > 0 && (
                  <StyledCard>
                    <StyledSectionHeader>
                      <StyledSectionIcon>
                        <Dumbbell size={16} />
                      </StyledSectionIcon>
                      <StyledSectionTitle>
                        {strings.progression.muscleFocusTitle}
                      </StyledSectionTitle>
                    </StyledSectionHeader>
                    <StyledMuscleList>
                      {muscleSeries.map(({ group, count, pct }) => (
                        <StyledMuscleRow key={group}>
                          <StyledMuscleName>{group}</StyledMuscleName>
                          <StyledMuscleBarWrap>
                            <StyledMuscleBar
                              $pct={pct}
                              $bg={
                                theme.colors.muscleGroups[group]?.text ??
                                theme.colors.primary
                              }
                            />
                          </StyledMuscleBarWrap>
                          <StyledMuscleCount>
                            {strings.progression.seriesUnit(count)}
                          </StyledMuscleCount>
                        </StyledMuscleRow>
                      ))}
                    </StyledMuscleList>
                  </StyledCard>
                )}
              </>
            ) : activeTab === "friends" ? (
              <FriendsTab />
            ) : (
              <>
                <StyledSectionCard>
                  <StyledSectionHeading>PERFIL</StyledSectionHeading>
                  <StyledProfileRow>
                    <StyledAvatarWrap>
                      {initials}
                      <StyledAvatarEdit
                        type="button"
                        onClick={() => setEditingName(true)}
                        aria-label="Editar nome"
                      >
                        ✎
                      </StyledAvatarEdit>
                    </StyledAvatarWrap>
                    <StyledProfileInfo>
                      {editingName ? (
                        <StyledNameInput
                          value={userName}
                          onChange={(event) => setUserName(event.target.value)}
                          onBlur={handleNameBlur}
                          onKeyDown={handleNameKeyDown}
                          autoFocus
                        />
                      ) : (
                        <StyledProfileName onClick={() => setEditingName(true)}>
                          {userName}
                        </StyledProfileName>
                      )}
                      <StyledProfileEmail>{userEmail}</StyledProfileEmail>
                    </StyledProfileInfo>
                  </StyledProfileRow>
                </StyledSectionCard>

                <StyledSectionCard>
                  <StyledSectionHeading>APARÊNCIA</StyledSectionHeading>
                  <StyledSectionLabel>Tema de Cor</StyledSectionLabel>
                  <StyledColorSwatchRow>
                    {themeOptions.map((option) => (
                      <StyledColorSwatch
                        key={option.id}
                        $selected={colorKey === option.id}
                        $color={option.primary}
                        onClick={() => setColorTheme(option.id)}
                      >
                        <StyledSwatchCircle
                          $selected={colorKey === option.id}
                          $color={option.primary}
                        >
                          {colorKey === option.id && (
                            <StyledSwatchCheck>✓</StyledSwatchCheck>
                          )}
                        </StyledSwatchCircle>
                        <StyledSwatchLabel>{option.name}</StyledSwatchLabel>
                      </StyledColorSwatch>
                    ))}
                  </StyledColorSwatchRow>

                  <StyledAppearanceRow>
                    <StyledSectionLabel>Aparência</StyledSectionLabel>
                    <StyledToggleGroup>
                      <StyledToggleOption
                        type="button"
                        $active={mode === "dark"}
                        onClick={() => mode !== "dark" && toggleMode()}
                      >
                        Escuro
                      </StyledToggleOption>
                      <StyledToggleOption
                        type="button"
                        $active={mode === "light"}
                        onClick={() => mode !== "light" && toggleMode()}
                      >
                        Claro
                      </StyledToggleOption>
                    </StyledToggleGroup>
                  </StyledAppearanceRow>
                </StyledSectionCard>

                {/* <StyledSectionCard>
                  <StyledSectionHeading>PREFERÊNCIAS</StyledSectionHeading>
                  <StyledPreferenceRow>
                    <StyledPreferenceInfo>
                      <StyledPreferenceLabel>
                        Tempo de descanso padrão
                      </StyledPreferenceLabel>
                    </StyledPreferenceInfo>
                    <StyledPreferenceControl>
                      <StyledControlButton
                        type="button"
                        onClick={() => handleRestChange(-5)}
                      >
                        −
                      </StyledControlButton>
                      <StyledControlValue>{restSeconds}s</StyledControlValue>
                      <StyledControlButton
                        type="button"
                        onClick={() => handleRestChange(5)}
                      >
                        +
                      </StyledControlButton>
                    </StyledPreferenceControl>
                  </StyledPreferenceRow>

                  <StyledPreferenceRow>
                    <StyledPreferenceInfo>
                      <StyledPreferenceLabel>
                        Unidade de peso
                      </StyledPreferenceLabel>
                    </StyledPreferenceInfo>
                    <StyledToggleGroup>
                      <StyledToggleOption
                        type="button"
                        $active={weightUnit === "kg"}
                        onClick={() => handleWeightToggle("kg")}
                      >
                        kg
                      </StyledToggleOption>
                      <StyledToggleOption
                        type="button"
                        $active={weightUnit === "lb"}
                        onClick={() => handleWeightToggle("lb")}
                      >
                        lb
                      </StyledToggleOption>
                    </StyledToggleGroup>
                  </StyledPreferenceRow>

                  <StyledLanguageRow
                    type="button"
                    onClick={handleLanguageClick}
                  >
                    <StyledSectionLabel>Idioma</StyledSectionLabel>
                    <StyledLanguageValue>{language} ›</StyledLanguageValue>
                  </StyledLanguageRow>
                </StyledSectionCard> */}

                <StyledSectionCard>
                  <StyledSectionHeading>CONTA</StyledSectionHeading>
                  <StyledSignOutButton type="button" onClick={logout}>
                    Sair
                  </StyledSignOutButton>{" "}
                </StyledSectionCard>
                <StyledSectionCard>
                  <StyledSectionHeading>DADOS</StyledSectionHeading>
                  <StyledHistoryRow
                    type="button"
                    onClick={() => router.push("/history")}
                  >
                    <StyledHistoryIcon>
                      <RotateCcw size={18} />
                    </StyledHistoryIcon>
                    <StyledHistoryInfo>
                      <StyledHistoryLabel>
                        Histórico de versões
                      </StyledHistoryLabel>
                      <StyledHistorySub>
                        {snapshotCount > 0
                          ? `${snapshotCount} versões salvas`
                          : "Nenhuma versão salva ainda"}
                      </StyledHistorySub>
                    </StyledHistoryInfo>
                    <StyledHistoryChevron>›</StyledHistoryChevron>
                  </StyledHistoryRow>
                </StyledSectionCard>
              </>
            )}
          </SlideTab>
        </StyledBody>
      </StyledPage>
    </PageTransition>
  );
}
