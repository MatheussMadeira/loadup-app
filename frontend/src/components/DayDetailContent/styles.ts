import styled from "styled-components";

export const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledSectionTitle = styled.h2`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

export const StyledExCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledExHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledExName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledExMuscle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const StyledSeriesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const StyledSeriesChip = styled.span`
  font-size: 12px;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.chip};
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

export const StyledEmptyText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  padding: ${({ theme }) => theme.spacing.md} 0;
  text-align: center;
`;

export const StyledSetList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const StyledSetRow = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  &:last-child {
    border-bottom: none;
  }
`;

export const StyledSetIndex = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const StyledSetType = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  min-width: 90px;
`;

export const StyledSetValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledSetMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
`;
