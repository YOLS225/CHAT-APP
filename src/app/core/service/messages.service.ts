import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export interface MessageDTO {
    content: string,
    roomId: string,
    type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | string,
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
        avatar?: string;
    };
}

export class MessagesService {
    constructor() {}
    protected urlBase = API_URL;

    async getAllMessages(id:string, search?:string): Promise<Action<Message[]>>{
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const query = params.toString();
        const url = `${this.urlBase}/messages/room/${id}${query ? `?${query}` : ""}`;

        return await apiFetchJson<Action<Message[]>>(url);
    }

    async sendMessage(data:MessageDTO): Promise<Action<unknown>>{
        const url = `${this.urlBase}/messages`;

        return await apiFetchJson<Action<unknown>>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateMessage(messageId: string, content: string): Promise<Action<unknown>>{
        const url = `${this.urlBase}/messages/${messageId}`;

        return await apiFetchJson<Action<unknown>>(url, {
            method: "PATCH",
            body: JSON.stringify({ content }),
        });
    }

    async deleteMessage(messageId: string): Promise<Action<unknown>>{
        const url = `${this.urlBase}/messages/${messageId}`;

        return await apiFetchJson<Action<unknown>>(url, {
            method: "DELETE",
        });
    }

}
