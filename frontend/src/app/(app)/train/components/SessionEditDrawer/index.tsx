"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Pencil, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

import { strings } from "@/constants/strings";
import { useUpdateRecord, useDeleteRecord } from "@/hooks/useSession";
import { Exercise, LoggedSet, TrainingSession } from "@/types";
import { SERIES_ABBR, SERIES_COLOR } from "../../utils";
import { useScrollLock } from "@/hooks/useScrollLock";

import {
  Backdrop,
  CloseBtn,
  DragArea,
  EditField,
  EditFieldLabel,
  EditFieldsRow,
  EditInput,
  EmptyText,
  ExerciseGroup,
  ExerciseGroupHeader,
  ExerciseGroupName,
  Handle,
  IconBtn,
  RowActions,
  SeriesBadge,
  SeriesList,
  SeriesOrder,
  SeriesRow,
  SeriesStatItem,
  SeriesStats,
  Sheet,
  SheetBody,
  SheetHeader,
  SheetTitle,
} from "./styles";

interface SessionEditDrawerProps {
  open: boolean;
  onClose: () => void;
  session: TrainingSession;
  exercises: Exercise[];
}

interface EditDraft {
  weight: string;
  repsCompleted: string;
  restTime: string;
}

export default function SessionEditDrawer({
  open,
  onClose,
  session,
  exercises,
}: SessionEditDrawerProps) {
  const updateRecord = useUpdateRecord(session._id);
  const deleteRecord = useDeleteRecord(session._id);

  const [mounted, setMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>({
    weight: "0",
    repsCompleted: "0",
    restTime: "0",
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [startY, setStartY] = useState(0);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useScrollLock();

  const groups = useMemo(() => {
    const byName = new Map<string, LoggedSet[]>();
    (session.records ?? []).forEach((record) => {
      const list = byName.get(record.exerciseName) ?? [];
      list.push(record);
      byName.set(record.exerciseName, list);
    });
    byName.forEach((list) => list.sort((a, b) => a.seriesOrder - b.seriesOrder));

    const knownNames = exercises
      .map((ex) => ex.name)
      .filter((name) => byName.has(name));
    const extraNames = Array.from(byName.keys()).filter(
      (name) => !knownNames.includes(name),
    );

    return [...knownNames, ...extraNames].map((name) => ({
      name,
      muscleGroup: exercises.find((ex) => ex.name === name)?.muscleGroup,
      records: byName.get(name)!,
    }));
  }, [session.records, exercises]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (dragY > 80) onClose();
    setDragY(0);
  };

  const handleEditClick = (record: LoggedSet) => {
    setEditingId(record._id);
    setDraft({
      weight: String(record.weight),
      repsCompleted: String(record.repsCompleted),
      restTime: String(record.restTime),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleConfirmEdit = (recordId: string) => {
    const weight = Math.max(0.5, parseFloat(draft.weight) || 0.5);
    const repsCompleted = Math.max(0, parseInt(draft.repsCompleted, 10) || 0);
    const restTime = Math.max(0, parseInt(draft.restTime, 10) || 0);

    setBusyId(recordId);
    updateRecord.mutate(
      { recordId, payload: { weight, repsCompleted, restTime } },
      {
        onSuccess: () => setEditingId(null),
        onError: () => toast.error("Erro ao salvar. Tente novamente."),
        onSettled: () => setBusyId(null),
      },
    );
  };

  const handleDelete = (recordId: string) => {
    setBusyId(recordId);
    deleteRecord.mutate(recordId, {
      onError: () => toast.error("Erro ao excluir. Tente novamente."),
      onSettled: () => setBusyId(null),
    });
  };

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <Backdrop onClick={onClose} />
      <Sheet
        style={{
          transform: `translateY(${dragY}px)`,
          transition:
            dragY > 0 ? "none" : "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <DragArea
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Handle />
          <SheetHeader>
            <SheetTitle>{strings.workout.loggedSetsTitle}</SheetTitle>
            <CloseBtn onClick={onClose} aria-label={strings.common.close}>
              <X size={16} />
            </CloseBtn>
          </SheetHeader>
        </DragArea>

        <SheetBody>
          {groups.length === 0 ? (
            <EmptyText>{strings.workout.emptyLogTitle}</EmptyText>
          ) : (
            groups.map((group) => (
              <ExerciseGroup key={group.name}>
                <ExerciseGroupHeader>
                  <ExerciseGroupName>{group.name}</ExerciseGroupName>
                </ExerciseGroupHeader>
                <SeriesList>
                  {group.records.map((record) => {
                    const isEditing = editingId === record._id;
                    const isBusy = busyId === record._id;
                    const color = SERIES_COLOR[record.seriesType];

                    return (
                      <SeriesRow key={record._id}>
                        <SeriesBadge $bg={color.bg} $text={color.text}>
                          {SERIES_ABBR[record.seriesType]}
                        </SeriesBadge>
                        <SeriesOrder>{record.seriesOrder}</SeriesOrder>

                        {isEditing ? (
                          <EditFieldsRow>
                            <EditField>
                              <EditFieldLabel>
                                {strings.workout.weightShort}
                              </EditFieldLabel>
                              <EditInput
                                type="number"
                                step={0.5}
                                min={0.5}
                                value={draft.weight}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    weight: e.target.value,
                                  }))
                                }
                              />
                            </EditField>
                            <EditField>
                              <EditFieldLabel>
                                {strings.workout.repsShort}
                              </EditFieldLabel>
                              <EditInput
                                type="number"
                                step={1}
                                min={0}
                                value={draft.repsCompleted}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    repsCompleted: e.target.value,
                                  }))
                                }
                              />
                            </EditField>
                            <EditField>
                              <EditFieldLabel>
                                {strings.workout.restShort}
                              </EditFieldLabel>
                              <EditInput
                                type="number"
                                step={5}
                                min={0}
                                value={draft.restTime}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    restTime: e.target.value,
                                  }))
                                }
                              />
                            </EditField>
                          </EditFieldsRow>
                        ) : (
                          <SeriesStats>
                            <SeriesStatItem>{record.weight} kg</SeriesStatItem>
                            <SeriesStatItem>
                              {record.repsCompleted} reps
                            </SeriesStatItem>
                            <SeriesStatItem>
                              {record.restTime}s
                            </SeriesStatItem>
                          </SeriesStats>
                        )}

                        <RowActions>
                          {isEditing ? (
                            <>
                              <IconBtn
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={isBusy}
                                aria-label={strings.common.ariaCancelEdit}
                              >
                                <X size={15} />
                              </IconBtn>
                              <IconBtn
                                type="button"
                                $variant="primary"
                                onClick={() => handleConfirmEdit(record._id)}
                                disabled={isBusy}
                                aria-label={strings.common.ariaConfirmEdit}
                              >
                                <Check size={15} />
                              </IconBtn>
                            </>
                          ) : (
                            <>
                              <IconBtn
                                type="button"
                                onClick={() => handleEditClick(record)}
                                disabled={isBusy}
                                aria-label={strings.common.ariaEditSet}
                              >
                                <Pencil size={14} />
                              </IconBtn>
                              <IconBtn
                                type="button"
                                $variant="danger"
                                onClick={() => handleDelete(record._id)}
                                disabled={isBusy}
                                aria-label={strings.common.ariaDeleteSet}
                              >
                                <Trash2 size={14} />
                              </IconBtn>
                            </>
                          )}
                        </RowActions>
                      </SeriesRow>
                    );
                  })}
                </SeriesList>
              </ExerciseGroup>
            ))
          )}
        </SheetBody>
      </Sheet>
    </>,
    document.body,
  );
}
