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
}



interface PaginatedData {
    content:[]
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

    async uploadAvatar(userId: string, file: File): Promise<Action<{ avatarUrl: string }>> {
        const url = `${this.urlBase}/storage/upload/avatar/${userId}`;
        const formData = new FormData();
        formData.append("file", file);
        return await apiFetchJson<Action<{ avatarUrl: string }>>(url, {
            method: "POST",
            body: formData,
        });
    }

    async deleteUser(id: string): Promise<Action<unknown>> {
        const url = `${this.urlBase}/users/${id}`;
        return await apiFetchJson<Action<unknown>>(url, {
            method: "DELETE",
        });
    }

    async getAllUsers(page?:1, page_size?:100000, search?:string): Promise<Action<PaginatedData>>{
        const url = search === undefined || search === ""
            ? `${this.urlBase}/users?page=${page}&page_size=${page_size}`
            : `${this.urlBase}/users?page=${page}&page_size=${page_size}&search=${search}`;

        return await apiFetchJson<Action<PaginatedData>>(url);
    }

}