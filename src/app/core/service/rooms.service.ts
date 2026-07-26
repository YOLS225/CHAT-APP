import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export interface RoomMember {
    id: string;
    role: "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";
    isActive: boolean;
    userId: string;
    roomId: string;
    joinedAt: string;
    user: {
        id: string;
        userName: string;
        avatar?: string;
    };
}

export interface RoomDTO {
    workspaceId: string,
    name: string,
    description: string,
    isPrivate: boolean,
    isDirectMessage: boolean
}

interface OtherUser {
    id?: string;
    userName?: string;
    avatar?: string;
    isOnline?: boolean;
}

export interface Room {
    id?: string;
    name: string;
    displayName?: string;
    description?: string;
    isPrivate: boolean;
    isDirectMessage: boolean;
    isDeleted?: boolean;
    lastMessage?: string;
    otherUser?: OtherUser | null;
    createdAt?: string;
}

export class RoomsService {
    constructor() {}
    protected urlBase = API_URL;

    async getAllChat(workspaceId:string, search?:string): Promise<Action<Room[]>>{
        return await this.getRoomsByType(workspaceId, true, search);
    }

    async getAllRooms(workspaceId:string, search?:string): Promise<Action<Room[]>>{
        return await this.getRoomsByType(workspaceId, false, search);
    }

    private async getRoomsByType(workspaceId: string, isDirectMessage: boolean, search?: string): Promise<Action<Room[]>> {
        const params = new URLSearchParams({
            workspaceId,
            isDirectMessage: String(isDirectMessage),
        });
        if (search) params.set("search", search);

        return await apiFetchJson<Action<Room[]>>(`${this.urlBase}/rooms?${params.toString()}`);
    }

    async createRoom(data:RoomDTO): Promise<Action<Room>>{
        const url = `${this.urlBase}/rooms`;

        return await apiFetchJson<Action<Room>>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async getRoomMembers(roomId: string): Promise<Action<RoomMember[]>> {
        const url = `${this.urlBase}/rooms/members/${roomId}`;
        return await apiFetchJson<Action<RoomMember[]>>(url);
    }

    async updateMemberRole(memberId: string, role: RoomMember["role"]): Promise<Action<unknown>> {
        const url = `${this.urlBase}/room-members/${memberId}/role`;
        return await apiFetchJson<Action<unknown>>(url, {
            method: "PATCH",
            body: JSON.stringify({role}),
        });
    }

    async kickMember(memberId: string): Promise<Action<unknown>> {
        const url = `${this.urlBase}/room-members/${memberId}/kick`;
        return await apiFetchJson<Action<unknown>>(url, {
            method: "DELETE",
        });
    }

    async joinRoom(data: {roomId: string}): Promise<Action<unknown>>{
        const url = `${this.urlBase}/room-members`;

        return await apiFetchJson<Action<unknown>>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

}
