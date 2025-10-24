import {API_URL} from "@/app/core/service/general.service";
import {useUserStore} from "@/app/core/stores/auth.store";

export class RoomsService {
    constructor() {}
    protected urlBase = API_URL;
    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            const user = useUserStore.getState().result;
            return user?.token || null;
        }
        return null;
    }

    async getAllChat(id:string){
        const url = `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=true`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.getToken()}`
            },
        })
        return await response.json();
    }

    async getAllRooms({id}: { id: string}){
        const url = `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=false`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.getToken()}`
            },
        })
        return await response.json();
    }

}