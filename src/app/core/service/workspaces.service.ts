import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";
import type {Room} from "@/app/core/service/rooms.service";
import type {UserData} from "@/app/core/service/users.service";

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";
export type WorkspaceMemberStatus = "ACTIVE" | "INVITED" | "DISABLED";

export interface Workspace {
    id: string;
    name: string;
    role?: WorkspaceRole;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkspaceImportResult {
    preview?: Array<{
        email: string;
        userName: string;
        role: WorkspaceRole;
        action: string;
    }>;
    imported?: Array<{
        email: string;
        userId?: string;
        action: string;
        invitationUrl?: string;
        emailSent?: boolean;
        emailSkipped?: boolean;
        emailError?: string;
    }>;
    errors?: Array<{
        email?: string;
        line?: number;
        message: string;
    }>;
}

export class WorkspacesService {
    protected urlBase = API_URL;

    async createWorkspace(data: {name: string}): Promise<Action<Workspace>> {
        const url = `${this.urlBase}/workspaces`;
        return await apiFetchJson<Action<Workspace>>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async getMyWorkspaces(): Promise<Action<Workspace[]>> {
        const url = `${this.urlBase}/workspaces`;
        return await apiFetchJson<Action<Workspace[]>>(url);
    }

    async getWorkspaceUsers(workspaceId: string, search?: string): Promise<Action<UserData[]>> {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const query = params.toString();
        const url = `${this.urlBase}/workspaces/${workspaceId}/users${query ? `?${query}` : ""}`;
        return await apiFetchJson<Action<UserData[]>>(url);
    }

    async importUsersFromFile(workspaceId: string, file: File, dryRun: boolean): Promise<Action<WorkspaceImportResult>> {
        const params = new URLSearchParams({dryRun: String(dryRun)});
        const url = `${this.urlBase}/workspaces/${workspaceId}/users/import/excel?${params.toString()}`;
        const formData = new FormData();
        formData.append("file", file);

        return await apiFetchJson<Action<WorkspaceImportResult>>(url, {
            method: "POST",
            body: formData,
        });
    }

    async updateWorkspaceMember(
        workspaceId: string,
        userId: string,
        data: {role?: WorkspaceRole; status?: WorkspaceMemberStatus}
    ): Promise<Action<{
        id: string;
        role: WorkspaceRole;
        status: WorkspaceMemberStatus;
        user: UserData;
    }>> {
        const url = `${this.urlBase}/workspaces/${workspaceId}/users/${userId}`;
        return await apiFetchJson<Action<{
            id: string;
            role: WorkspaceRole;
            status: WorkspaceMemberStatus;
            user: UserData;
        }>>(url, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async disableWorkspaceMember(workspaceId: string, userId: string): Promise<Action<{
        id: string;
        role: WorkspaceRole;
        status: WorkspaceMemberStatus;
        user: UserData;
    }>> {
        const url = `${this.urlBase}/workspaces/${workspaceId}/users/${userId}`;
        return await apiFetchJson<Action<{
            id: string;
            role: WorkspaceRole;
            status: WorkspaceMemberStatus;
            user: UserData;
        }>>(url, {
            method: "DELETE",
        });
    }

    async createOrGetDirectMessage(workspaceId: string, targetUserId: string): Promise<Action<Room>> {
        const url = `${this.urlBase}/workspaces/${workspaceId}/dms`;
        return await apiFetchJson<Action<Room>>(url, {
            method: "POST",
            body: JSON.stringify({targetUserId}),
        });
    }
}
