"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import styled, { keyframes } from "styled-components";

import { toast } from "sonner";

import {
  useSnapshots,
  useRestoreSnapshot,
  useSaveSnapshot,
} from "@/hooks/useTrainingSheet";

const MUSCLE_FILTERS = [
  "Todos",
  "Peito",
  "Costas",
  "Perna",
  "Bíceps",
  "Tríceps",
  "Ombros",
  "Abdômen",
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    day: date
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      .toUpperCase(),
    year: date.getFullYear().toString(),
  };
}

export default function HistoryPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");

  const snapshots = useSnapshots(
    activeFilter === "Todos" ? undefined : activeFilter,
  );
  const restore = useRestoreSnapshot();
  const save = useSaveSnapshot();

  const snapshotToRestore = snapshots.data?.find((s) => s._id === restoreId);

  const handleRestore = async () => {
    if (!restoreId) return;
    try {
      await restore.mutateAsync(restoreId);
      toast.success("Versão restaurada com sucesso!");
      setRestoreId(null);
      router.back();
    } catch {
      toast.error("Erro ao restaurar versão. Tente novamente.");
    }
  };

  const handleSave = async () => {
    try {
      await save.mutateAsync(saveLabel.trim() || undefined);
      toast.success("Versão salva com sucesso!");
      setSaveLabel("");
      setShowSaveModal(false);
    } catch {
      toast.error("Erro ao salvar versão. Tente novamente.");
    }
  };

  return (
    <PageWrapper>
      <TopBar>
        <BackBtn onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </BackBtn>
        <SaveBtn onClick={() => setShowSaveModal(true)}>
          <Save size={16} />
          Salvar versão
        </SaveBtn>
      </TopBar>

      <PageTitle>HISTÓRICO</PageTitle>

      <FilterScroll>
        {MUSCLE_FILTERS.map((f) => (
          <FilterChip
            key={f}
            $active={activeFilter === f}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </FilterChip>
        ))}
      </FilterScroll>

      {snapshots.isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : snapshots.data?.length === 0 ? (
        <EmptyState>
          <RotateCcw size={40} strokeWidth={1.5} />
          <EmptyTitle>Nenhuma versão salva</EmptyTitle>
          <EmptySubtitle>
            Salve uma versão manual ou copie um treino de amigo para criar um
            histórico automático
          </EmptySubtitle>
        </EmptyState>
      ) : (
        <SnapshotList>
          {snapshots.data?.map((snap, i) => {
            const { day, year } = formatDate(snap.createdAt);
            return (
              <SnapshotItem key={snap._id}>
                <SnapshotCard>
                  <DateCol>
                    <DateDay>{day}</DateDay>
                    <DateYear>{year}</DateYear>
                  </DateCol>
                  <SnapContent>
                    <SnapLabel>&ldquo;{snap.label}&rdquo;</SnapLabel>
                    <MuscleChips>
                      {snap.muscleGroups.slice(0, 3).map((m) => (
                        <MuscleChip key={m}>{m}</MuscleChip>
                      ))}
                      {snap.muscleGroups.length > 3 && (
                        <MuscleChip>+{snap.muscleGroups.length - 3}</MuscleChip>
                      )}
                    </MuscleChips>
                    <SnapMeta>{snap.totalExercises} exercícios</SnapMeta>
                  </SnapContent>
                  <SnapActions>
                    <TypeBadge $auto={snap.type === "auto"}>
                      {snap.type === "auto" ? "Auto" : "Manual"}
                    </TypeBadge>
                    <RestoreBtn onClick={() => setRestoreId(snap._id)}>
                      Restaurar
                    </RestoreBtn>
                  </SnapActions>
                </SnapshotCard>
                {i < (snapshots.data?.length ?? 0) - 1 && <Divider />}
              </SnapshotItem>
            );
          })}
        </SnapshotList>
      )}

      {restoreId && snapshotToRestore && (
        <RestoreModal
          label={snapshotToRestore.label}
          date={formatDate(snapshotToRestore.createdAt).day}
          isPending={restore.isPending}
          onConfirm={handleRestore}
          onClose={() => setRestoreId(null)}
        />
      )}

      {showSaveModal && (
        <SaveModal
          label={saveLabel}
          onChange={setSaveLabel}
          isPending={save.isPending}
          onConfirm={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </PageWrapper>
  );
}

/* ─── Restore Modal ──────────────────────────────── */

function RestoreModal({
  label,
  date,
  isPending,
  onConfirm,
  onClose,
}: {
  label: string;
  date: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <Modal>
        <ModalIconWrapper>
          <RotateCcw size={26} />
        </ModalIconWrapper>
        <ModalTitle>Restaurar versão?</ModalTitle>
        <ModalText>
          Seu treino atual será substituído pela versão {`"${label}"`}. Esta
          ação não pode ser desfeita.
        </ModalText>
        <ModalConfirmBtn onClick={onConfirm} disabled={isPending}>
          {isPending ? "Restaurando..." : "Restaurar"}
        </ModalConfirmBtn>
        <ModalCancelBtn onClick={onClose}>Cancelar</ModalCancelBtn>
      </Modal>
    </>
  );
}

/* ─── Save Modal ─────────────────────────────────── */

function SaveModal({
  label,
  onChange,
  isPending,
  onConfirm,
  onClose,
}: {
  label: string;
  onChange: (v: string) => void;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <Modal>
        <ModalIconWrapper>
          <Save size={26} />
        </ModalIconWrapper>
        <ModalTitle>Salvar versão</ModalTitle>
        <ModalText>
          Dê um nome para identificar esta versão do seu treino.
        </ModalText>
        <SaveInput
          placeholder="Ex: Meu treino favorito"
          value={label}
          onChange={(e) => onChange(e.target.value)}
        />
        <ModalConfirmBtn onClick={onConfirm} disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </ModalConfirmBtn>
        <ModalCancelBtn onClick={onClose}>Cancelar</ModalCancelBtn>
      </Modal>
    </>
  );
}

/* ─── Styled Components ─────────────────────────── */

const PageWrapper = styled.div`
  min-height: 100%;
  background: ${({ theme }) => theme.colors.background};
  margin: 0 auto;
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  color: ${({ theme }) => theme.colors.onSurface};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const SaveBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
`;

const PageTitle = styled.h1`
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 28px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
`;

const FilterScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 150ms ease;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surfaceElevated};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.onPrimary : theme.colors.onSurfaceMuted};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.outlineVariant};
  box-shadow: ${({ $active }) =>
    $active ? "0 0 16px rgba(59,130,246,0.4)" : "none"};
`;

const SnapshotList = styled.div`
  display: flex;
  flex-direction: column;
`;

const SnapshotItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const SnapshotCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: 16px;
`;

const DateCol = styled.div`
  width: 52px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DateDay = styled.span`
  font-family: var(--font-bebas), sans-serif;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1;
`;

const DateYear = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const SnapContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SnapLabel = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const MuscleChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const MuscleChip = styled.span`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  font-family: var(--font-barlow), sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
`;

const SnapMeta = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const SnapActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
`;

const TypeBadge = styled.span<{ $auto: boolean }>`
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid;
  border-color: ${({ theme, $auto }) =>
    $auto ? theme.colors.outlineVariant : `${theme.colors.primary}60`};
  color: ${({ theme, $auto }) =>
    $auto ? theme.colors.onSurfaceMuted : theme.colors.primary};
`;

const RestoreBtn = styled.button`
  height: 28px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryContainer};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.outlineVariant};
  opacity: 0.3;
  margin: 4px 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 64px 24px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
`;

const EmptyTitle = styled.p`
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 20px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
`;

const EmptySubtitle = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 0;
  line-height: 1.6;
`;

/* ─── Modal Shared ───────────────────────────────── */

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 490;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 48px);
  max-width: 340px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 500;
  text-align: center;
`;

const ModalIconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;

const ModalTitle = styled.h2`
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 22px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
`;

const ModalText = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 0;
  line-height: 1.6;
`;

const SaveInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.chip};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  font-family: var(--font-inter), sans-serif;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurface};
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.colors.onSurfaceMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ModalConfirmBtn = styled.button`
  width: 100%;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.4);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ModalCancelBtn = styled.button`
  width: 100%;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const SkeletonCard = styled.div`
  height: 88px;
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surface} 25%,
    ${({ theme }) => theme.colors.surfaceElevated} 50%,
    ${({ theme }) => theme.colors.surface} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear;
`;
