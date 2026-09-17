"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotification";
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from "@/hooks/useFriendship";
import {
  StyledOverlay,
  StyledModal,
  Header,
  Title,
  CloseButton,
  DismissAllLink,
  NotifList,
  NotifCard,
  NotifAvatar,
  NotifContent,
  NotifText,
  NotifName,
  NotifTime,
  NotifActions,
  AcceptBtn,
  RejectBtn,
  ViewBtn,
  UnreadDot,
  NotifDivider,
  EmptyNotif,
} from "./styles";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins} min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days === 1) return "Ontem";
  return `${days} dias atrás`;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const router = useRouter();
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  const notifications = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const accept = useAcceptFriendRequest();
  const reject = useRejectFriendRequest();

  const unreadCount = notifications.data?.filter((n) => !n.read).length ?? 0;

  if (!isOpen) return null;

  const handleAccept = (friendshipId: string, notifId: string) => {
    accept.mutate(friendshipId, {
      onSuccess: () => {
        markAsRead.mutate(notifId);
        setProcessedIds((prev) => new Set(Array.from(prev).concat(notifId)));
        toast.success("Pedido aceito! Agora vocês são amigos 🎉");
      },
      onError: (error: any) => {
        const msg = error?.message ?? "";
        if (
          msg.includes("already handled") ||
          msg.includes("Already friends")
        ) {
          setProcessedIds((prev) => new Set(Array.from(prev).concat(notifId)));
          markAsRead.mutate(notifId);
          toast("Este pedido já foi processado anteriormente.");
        } else {
          toast.error("Erro ao aceitar pedido. Tente novamente.");
        }
      },
    });
  };

  const handleReject = (friendshipId: string, notifId: string) => {
    reject.mutate(friendshipId, {
      onSuccess: () => {
        markAsRead.mutate(notifId);
        setProcessedIds((prev) => new Set(Array.from(prev).concat(notifId)));
        toast("Pedido recusado.");
      },
      onError: (error: any) => {
        const msg = error?.message ?? "";
        if (msg.includes("already handled")) {
          setProcessedIds((prev) => new Set(Array.from(prev).concat(notifId)));
          markAsRead.mutate(notifId);
          toast("Este pedido já foi processado anteriormente.");
        } else {
          toast.error("Erro ao recusar pedido. Tente novamente.");
        }
      },
    });
  };

  return (
    <StyledOverlay onClick={onClose}>
      <StyledModal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            Notificações{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Title>
          <CloseButton onClick={onClose} aria-label="Close">
            ×
          </CloseButton>
        </Header>

        {unreadCount > 0 && (
          <DismissAllLink
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            Marcar todas como lidas
          </DismissAllLink>
        )}
        <NotifList>
          {notifications.isLoading ? (
            <EmptyNotif>Carregando...</EmptyNotif>
          ) : notifications.data?.length === 0 ? (
            <EmptyNotif>Nenhuma notificação ainda</EmptyNotif>
          ) : (
            notifications.data?.map((notif, i) => (
              <div key={notif._id}>
                <NotifCard
                  $unread={!notif.read}
                  onClick={() => !notif.read && markAsRead.mutate(notif._id)}
                >
                  <NotifAvatar>{getInitials(notif.fromUserName)}</NotifAvatar>
                  <NotifContent>
                    <NotifText>
                      <NotifName>{notif.fromUserName}</NotifName>{" "}
                      {notif.type === "friend_request"
                        ? "enviou um pedido de amizade"
                        : "aceitou seu pedido de amizade"}
                    </NotifText>
                    <NotifTime>{timeAgo(notif.createdAt)}</NotifTime>
                    <NotifActions>
                      {notif.type === "friend_request" &&
                        !notif.read &&
                        notif.friendshipId &&
                        !processedIds.has(notif._id) && (
                          <>
                            <AcceptBtn
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(notif.friendshipId!, notif._id);
                              }}
                              disabled={accept.isPending || reject.isPending}
                            >
                              {accept.isPending ? "Aceitando..." : "Aceitar"}
                            </AcceptBtn>
                            <RejectBtn
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(notif.friendshipId!, notif._id);
                              }}
                              disabled={accept.isPending || reject.isPending}
                            >
                              {reject.isPending ? "Recusando..." : "Recusar"}
                            </RejectBtn>
                          </>
                        )}
                      {notif.type === "friend_accepted" && (
                        <ViewBtn
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            router.push(`/friends/${notif.fromUserId}`);
                          }}
                        >
                          Ver treino
                        </ViewBtn>
                      )}
                    </NotifActions>
                  </NotifContent>
                  {!notif.read && <UnreadDot />}
                </NotifCard>
                {i < (notifications.data?.length ?? 0) - 1 && <NotifDivider />}
              </div>
            ))
          )}
        </NotifList>
      </StyledModal>
    </StyledOverlay>
  );
}

export default NotificationsModal;
