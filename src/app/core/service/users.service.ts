import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export interface UserData {
    id: string;
    userName: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: "ACTIVE" | "INACTIVE" | "BANNED" | "SUSPENDED";
    role?: "OWNER" | "ADMIN" | "MEMBER";
    memberId?: string;
    membershipStatus?: "ACTIVE" | "INVITED" | "DISABLED";
}



interface PaginatedData {
    content:UserData[]
    page: number;
    page_size: number;
    total: number;
}

export class UsersService {
    constructor() {}
    protected urlBase = API_URL;

    async getUserById(id: string): Promise<Action<UserData>> {
        const url = `${this.urlBase}/users/${id}`;
        return await apiFetchJson<Action<UserData>>(url);
    }

    async updateUser(id: string, data: Partial<Pick<UserData, "userName" | "email" | "avatar">>): Promise<Action<UserData>> {
        const url = `${this.urlBase}/users/${id}`;
        return await apiFetchJson<Action<UserData>>(url, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<Action<unknown>> {
        const url = `${this.urlBase}/users/${id}/password`;
        return await apiFetchJson<Action<unknown>>(url, {
            method: "PATCH",
            body: JSON.stringify({currentPassword, newPassword}),
        });
    }

    async deleteUser(id: string): Promise<Action<unknown>> {
        const url = `${this.urlBase}/users/${id}`;
        return await apiFetchJson<Action<unknown>>(url, {
            method: "DELETE",
        });
    }

    async getAllUsers(page = 1, page_size = 100000, search?:string, workspaceId?: string): Promise<Action<PaginatedData>>{
        const params = new URLSearchParams({
            page: String(page),
            page_size: String(page_size),
        });

        if (workspaceId) params.set("workspaceId", workspaceId);
        if (search) params.set("search", search);

        const url = `${this.urlBase}/users?${params.toString()}`;

        return await apiFetchJson<Action<PaginatedData>>(url);
    }

}
