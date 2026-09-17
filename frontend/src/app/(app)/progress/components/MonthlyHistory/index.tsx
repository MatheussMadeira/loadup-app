"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";

import CalendarGrid from "@/components/CalendarGrid";
import DayDetailContent from "@/components/DayDetailContent";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { strings } from "@/constants/strings";
import { useDayDetails, useMonthlyCalendar } from "@/hooks/useCalendar";
import { formatFullDate } from "@/lib/formatDate";

import {
  StyledCard,
  StyledSectionHeader,
  StyledSectionIcon,
  StyledSectionTitle,
  StyledSkeletonCard,
} from "../../styles";

function DayModalBody({ date }: { date: string }) {
  const dayDetails = useDayDetails(date);

  if (dayDetails.isLoading) {
    return <StyledSkeletonCard style={{ height: 160, margin: 0 }} />;
  }

  if (dayDetails.error || !dayDetails.data) {
    return <p>{strings.common.error}</p>;
  }

  const records = dayDetails.data.recordedSession?.records ?? [];

  if (records.length === 0) {
    return (
      <EmptyState
        title={strings.sessionHistory.missedDayTitle}
        description={strings.sessionHistory.missedDaySubtitle}
      />
    );
  }

  return (
    <DayDetailContent
      plannedExercises={dayDetails.data.plannedWorkout?.exercises}
      records={records}
    />
  );
}

export default function MonthlyHistory() {
  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthly = useMonthlyCalendar(cursor.year, cursor.month);

  return (
    <StyledCard>
      <StyledSectionHeader>
        <StyledSectionIcon>
          <CalendarDays size={16} />
        </StyledSectionIcon>
        <StyledSectionTitle>
          {strings.progression.monthlyHistoryTitle}
        </StyledSectionTitle>
      </StyledSectionHeader>

      {monthly.isLoading || !monthly.data ? (
        <StyledSkeletonCard style={{ height: 320, margin: 0 }} />
      ) : (
        <CalendarGrid
          calendar={monthly.data}
          onMonthChange={(year, month) => setCursor({ year, month })}
          onDaySelect={setSelectedDate}
        />
      )}

      <Modal
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? formatFullDate(selectedDate) : undefined}
      >
        {selectedDate && <DayModalBody date={selectedDate} />}
      </Modal>
    </StyledCard>
  );
}
