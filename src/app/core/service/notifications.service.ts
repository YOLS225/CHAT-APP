import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export type NotificationType =
    | "USER_INVITED"
    | "ROOM_MEMBER_ADDED"
    | "ROOM_MEMBER_REMOVED"
    | "IMPORT_COMPLETED"
    | "IMPORT_FAILED"
    | "DM_MESSAGE";

export interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    message?: string;
    readAt?: string | null;
    createdAt?: string;
    workspaceId?: string;
    data?: Record<string, unknown>;
}

export class NotificationsService {
    protected urlBase = API_URL;

    async getNotifications(workspaceId?: string, unreadOnly?: boolean): Promise<Action<Notification[]>> {
        const params = new URLSearchParams();
        if (workspaceId) params.set("workspaceId", workspaceId);
        if (unreadOnly !== undefined) params.set("unreadOnly", String(unreadOnly));

        const query = params.toString();
        const url = `${this.urlBase}/notifications${query ? `?${query}` : ""}`;
        return await apiFetchJson<Action<Notification[]>>(url);
    }

    async getUnreadCount(workspaceId?: string): Promise<Action<{count: number}>> {
        const params = new URLSearchParams();
        if (workspaceId) params.set("workspaceId", workspaceId);

        const query = params.toString();
        const url = `${this.urlBase}/notifications/unread-count${query ? `?${query}` : ""}`;
        return await apiFetchJson<Action<{count: number}>>(url);
    }

    async markAsRead(id: string): Promise<Action<unknown>> {
        const url = `${this.urlBase}/notifications/${id}/read`;
        return await apiFetchJson<Action<unknown>>(url, {
            method: "PATCH",
        });
    }

    async markAllAsRead(workspaceId?: string): Promise<Action<unknown>> {
        const params = new URLSearchParams();
        if (workspaceId) params.set("workspaceId", workspaceId);

        const query = params.toString();
        const url = `${this.urlBase}/notifications/read-all${query ? `?${query}` : ""}`;
        return await apiFetchJson<Action<unknown>>(url, {
            method: "PATCH",
        });
    }
}
