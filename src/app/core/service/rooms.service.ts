import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

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

    async joinRoom(data: {role: string, isActive: boolean, userId: string, roomId: string}): Promise<Action<unknown>>{
        const url = `${this.urlBase}/room-members`;

        return await apiFetchJson<Action<unknown>>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

}