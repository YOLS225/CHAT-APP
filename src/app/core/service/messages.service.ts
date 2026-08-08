import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export interface MessageDTO {
    content?: string,
    roomId: string,
    type?: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "SYSTEM" | string,
    attachmentIds?: string[],
}

export interface MessageAttachment {
    id: string;
    key: string;
    url?: string | null;
    fileName: string;
    mimeType: string;
    size: number;
    kind: "IMAGE" | "DOCUMENT" | "AUDIO";
    durationMs?: number | null;
}

export interface Message {
    id: string;
    content: string;
    isDeleted: boolean;
    type: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "SYSTEM" | string;
    createdAt: string;
    updatedAt: string;
    sender: {
        id?: string;
        userName: string;
        avatar?: string | null;
    };
    attachments?: MessageAttachment[];
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
