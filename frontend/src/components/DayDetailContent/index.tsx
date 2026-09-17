"use client";

import { strings } from "@/constants/strings";
import { DayRecord, Exercise } from "@/types";

import {
  StyledEmptyText,
  StyledExCard,
  StyledExHeader,
  StyledExMuscle,
  StyledExName,
  StyledSection,
  StyledSectionTitle,
  StyledSeriesChip,
  StyledSeriesRow,
  StyledSetIndex,
  StyledSetList,
  StyledSetMeta,
  StyledSetRow,
  StyledSetType,
  StyledSetValue,
} from "./styles";

interface DayDetailContentProps {
  plannedExercises?: Exercise[];
  records: DayRecord[];
}

export default function DayDetailContent({
  plannedExercises = [],
  records,
}: DayDetailContentProps) {
  // Agrupa records por exercício, preservando a ordem de seriesOrder (o
  // backend já devolve ordenado, mas o group-by por si so nao garante isso).
  const recordsByExercise = [...records]
    .sort((a, b) => a.seriesOrder - b.seriesOrder)
    .reduce<Record<string, DayRecord[]>>((acc, r) => {
      const key = r.exerciseName;
      acc[key] = acc[key] ? [...acc[key], r] : [r];
      return acc;
    }, {});

  return (
    <>
      {plannedExercises.length > 0 && (
        <StyledSection>
          <StyledSectionTitle>
            {strings.sessionHistory.plannedWorkout}
          </StyledSectionTitle>
          {plannedExercises.map((ex) => (
            <StyledExCard key={ex._id ?? ex.name}>
              <StyledExHeader>
                <StyledExName>{ex.name}</StyledExName>
                <StyledExMuscle>{ex.muscleGroup}</StyledExMuscle>
              </StyledExHeader>
              <StyledSeriesRow>
                {ex.series.map((s, i) => (
                  <StyledSeriesChip key={i}>
                    {strings.exercises.seriesType[s.type]} ·{" "}
                    {s.repsMin === s.repsMax
                      ? `${s.repsMin} rep`
                      : `${s.repsMin}–${s.repsMax} reps`}
                  </StyledSeriesChip>
                ))}
              </StyledSeriesRow>
            </StyledExCard>
          ))}
        </StyledSection>
      )}

      <StyledSection>
        <StyledSectionTitle>
          {strings.sessionHistory.recordedSets}
        </StyledSectionTitle>
        {records.length === 0 ? (
          <StyledEmptyText>{strings.sessionHistory.noRecords}</StyledEmptyText>
        ) : (
          Object.entries(recordsByExercise).map(([exName, sets]) => (
            <StyledExCard key={exName}>
              <StyledExName>{exName}</StyledExName>
              <StyledSetList>
                {sets.map((s, i) => (
                  <StyledSetRow key={i}>
                    <StyledSetIndex>{i + 1}</StyledSetIndex>
                    <StyledSetType>
                      {strings.exercises.seriesType[
                        s.seriesType as keyof typeof strings.exercises.seriesType
                      ] ?? s.seriesType}
                    </StyledSetType>
                    <StyledSetValue>
                      {strings.sessionHistory.weightReps(
                        s.weight,
                        s.repsCompleted,
                      )}
                    </StyledSetValue>
                    <StyledSetMeta>
                      {strings.sessionHistory.restLabel(s.restTime)}
                    </StyledSetMeta>
                  </StyledSetRow>
                ))}
              </StyledSetList>
            </StyledExCard>
          ))
        )}
      </StyledSection>
    </>
  );
}
