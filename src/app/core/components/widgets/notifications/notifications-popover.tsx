'use client';

import {Button} from "@/app/core/components/ui/button";
import {Badge} from "@/app/core/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger} from "@/app/core/components/ui/popover";
import {NotificationsService, Notification, NotificationType} from "@/app/core/service/notifications.service";
import {QUERIES} from "@/app/core/utils/constants";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Bell, CheckCheck, Inbox} from "lucide-react";
import {toast} from "sonner";
import {getApiMessage} from "@/app/core/utils/api-message";

function notificationLabel(type: NotificationType) {
    switch (type) {
        case "USER_INVITED":
            return "Invitation";
        case "ROOM_MEMBER_ADDED":
            return "Ajout salle";
        case "ROOM_MEMBER_REMOVED":
            return "Retrait salle";
        case "IMPORT_COMPLETED":
            return "Import terminé";
        case "IMPORT_FAILED":
            return "Import échoué";
        case "DM_MESSAGE":
            return "Message direct";
        default:
            return "Notification";
    }
}

function notificationTitle(notification: Notification) {
    return notification.title || notificationLabel(notification.type);
}

function notificationMessage(notification: Notification) {
    return notification.message || "Nouvelle activité dans le workspace.";
}

function notificationTime(notification: Notification) {
    if (!notification.createdAt) return "";
    return new Date(notification.createdAt).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function NotificationsPopover() {
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const service = new NotificationsService();
    const queryClient = useQueryClient();

    const {data: notifications = []} = useQuery({
        queryKey: [QUERIES.GET_NOTIFICATIONS, workspaceId],
        queryFn: async () => {
            const response = await service.getNotifications(workspaceId);
            return response.data ?? [];
        },
        enabled: !!workspaceId,
        refetchInterval: 15000,
    });

    const {data: unreadCount = 0} = useQuery({
        queryKey: [QUERIES.GET_UNREAD_NOTIFICATIONS_COUNT, workspaceId],
        queryFn: async () => {
            const response = await service.getUnreadCount(workspaceId);
            return response.data?.count ?? 0;
        },
        enabled: !!workspaceId,
        refetchInterval: 15000,
    });

    const invalidateNotifications = async () => {
        await queryClient.invalidateQueries({queryKey: [QUERIES.GET_NOTIFICATIONS, workspaceId]});
        await queryClient.invalidateQueries({queryKey: [QUERIES.GET_UNREAD_NOTIFICATIONS_COUNT, workspaceId]});
    };

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => service.markAsRead(id),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(getApiMessage(response, "Impossible de marquer la notification comme lue."));
                return;
            }
            await invalidateNotifications();
        },
        onError: (response) => toast.error(getApiMessage(response, "Impossible de marquer la notification comme lue.")),
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => service.markAllAsRead(workspaceId),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(getApiMessage(response, "Impossible de marquer les notifications comme lues."));
                return;
            }
            await invalidateNotifications();
            toast.success("Notifications marquées comme lues.");
        },
        onError: (response) => toast.error(getApiMessage(response, "Impossible de marquer les notifications comme lues.")),
    });

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    disabled={!workspaceId}
                    aria-label="Notifications"
                >
                    <Bell className="h-4 w-4"/>
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="right" className="w-96 p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                        <p className="text-xs text-muted-foreground">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                    >
                        <CheckCheck className="h-4 w-4"/>
                        Tout lire
                    </Button>
                </div>

                <div className="max-h-[420px] overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                            <Inbox className="h-6 w-6 text-muted-foreground"/>
                            <p className="mt-3 text-sm font-medium text-foreground">Aucune notification</p>
                            <p className="mt-1 text-xs text-muted-foreground">Les invitations, imports et DMs apparaîtront ici.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notification) => {
                                const isUnread = !notification.readAt;
                                return (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        className="w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted"
                                        onClick={() => {
                                            if (isUnread) markAsReadMutation.mutate(notification.id);
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {notificationTitle(notification)}
                                                    </p>
                                                    {isUnread && <span className="h-2 w-2 rounded-full bg-primary"/>}
                                                </div>
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {notificationMessage(notification)}
                                                </p>
                                                {notification.createdAt && (
                                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                                        {notificationTime(notification)}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="secondary" className="flex-shrink-0 text-[10px]">
                                                {notificationLabel(notification.type)}
                                            </Badge>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
