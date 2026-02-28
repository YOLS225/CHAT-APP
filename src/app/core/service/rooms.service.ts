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
    name: string,
    description: string,
    isPrivate: boolean,
    isDeleted: boolean,
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

    async getAllChat(id:string, search?:string): Promise<Action<Room[]>>{
        const url = search === undefined || search === ""
            ? `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=true`
            : `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=true&search=${search}`;

        return await apiFetchJson<Action<Room[]>>(url);
    }

    async getAllRooms(id:string, search?:string): Promise<Action<Room[]>>{
        const url = search === undefined || search === ""
            ? `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=false`
            : `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=false&search=${search}`;

        return await apiFetchJson<Action<Room[]>>(url);
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

    async joinRoom(data: {role: string, isActive: boolean, userId: string, roomId: string}): Promise<Action<unknown>>{
        const url = `${this.urlBase}/room-members`;

        return await apiFetchJson<Action<unknown>>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

}