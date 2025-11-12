import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export interface MessageDTO {
    content: string,
    senderId: string,
    roomId: string,
    type: "TEXT" | "IMAGE" | "VIDEO" | string,
    isDeleted: boolean
}

export interface Message {
    id: string;
    content: string;
    isDeleted: boolean;
    type: "TEXT" | "IMAGE" | "VIDEO" | string;
    createdAt: string;
    updatedAt: string;
    sender: {
        userName: string;
    };
}

export class MessagesService {
    constructor() {}
    protected urlBase = API_URL;

    async getAllMessages(id:string, search?:string): Promise<Action<Message[]>>{
        const url = search === undefined || search === ""
            ? `${this.urlBase}/messages/room/${id}`
            : `${this.urlBase}/messages/room/${id}?search=${search}`;

        return await apiFetchJson<Action<Message[]>>(url);
    }

    async sendMessage(data:MessageDTO): Promise<Action<unknown>>{
        const url = `${this.urlBase}/messages`;

        return await apiFetchJson<Action<unknown>>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

}