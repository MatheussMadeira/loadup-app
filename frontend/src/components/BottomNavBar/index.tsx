"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Dumbbell, User } from "lucide-react";
import styled from "styled-components";
import { useUnreadCount } from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import { strings } from "@/constants/strings";

const tabs = [
  { href: "/home", label: strings.nav.home, Icon: Home },
  {
    href: "/training-plan",
    label: strings.nav.trainingPlan,
    Icon: ClipboardList,
  },
  { href: "/train", label: strings.nav.workout, Icon: Dumbbell },
  { href: "/progress", label: strings.nav.progression, Icon: User },
] as const;

export default function BottomNavBar() {
  const pathname = usePathname();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  return (
    <StyledNav>
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <StyledTab key={tab.href} href={tab.href} $active={isActive}>
            <IconWrapper $active={isActive}>
              <tab.Icon
                size={22}
                color="currentColor"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              {tab.href === "/home" && unreadCount > 0 && (
                <NotifBadge>{unreadCount > 9 ? "9+" : unreadCount}</NotifBadge>
              )}
            </IconWrapper>
            <StyledLabel $active={isActive}>{tab.label}</StyledLabel>
          </StyledTab>
        );
      })}
    </StyledNav>
  );
}

// A altura vem de --bottom-nav-height (globalStyles) e e a mesma medida que
// todo elemento flutuante usa como piso, entao nao existe mais chute de
// "quantos px a nav ocupa" espalhado pelas telas.
const StyledNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  padding-bottom: var(--safe-bottom);
  background-color: ${({ theme }) => theme.colors.glassOverlay};
  border-top: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  /* Mantem a barra na propria camada composta: no WebKit isso evita o
     repaint atrasado que fazia a barra "grudar" no meio da tela. */
  transform: translateZ(0);
  z-index: 100;
`;

const StyledTab = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex: 1;
  height: 100%;
  min-width: 64px;
  max-width: 96px;
  padding: 0;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background-color: ${({ theme, $active }) =>
    $active ? "transparent" : "transparent"};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.onSurfaceMuted};
  text-decoration: none;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const IconWrapper = styled.div<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryContainer : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.onSurfaceMuted};
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
`;

const StyledLabel = styled.span<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.labelSmall.fontWeight};
  line-height: 1.2;
  color: inherit;
`;
const NotifBadge = styled.span`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  color: #ffffff;
  font-family: var(--font-inter), sans-serif;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;
