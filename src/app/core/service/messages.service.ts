import {API_URL} from "@/app/core/service/general.service";
import {useUserStore} from "@/app/core/stores/auth.store";

export interface MessageDTO {
    content: string,
    senderId: string,
    roomId: string,
    type: "TEXT" | "IMAGE" | "VIDEO" | string,
    isDeleted: boolean
}

export class MessagesService {
    constructor() {}
    protected urlBase = API_URL;
    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            const user = useUserStore.getState().result;
            return user?.token || null;
        }
        return null;
    }

    async getAllMessages(id:string,search?:string){
        const url =search === undefined || search === ""
            ? `${this.urlBase}/messages/room/${id}` : `${this.urlBase}/messages/room/${id}?search=${search}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.getToken()}`
            },
        })
        return await response.json();
    }

    async sendMessage(data:MessageDTO){
        const url = `${this.urlBase}/messages`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    }
    // async getAllRooms({id}: { id: string}){
    //     const url = `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=false`;
    //     const response = await fetch(url, {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": `Bearer ${this.getToken()}`
    //         },
    //     })
    //     return await response.json();
    // }

}