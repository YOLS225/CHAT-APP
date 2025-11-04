import {API_URL} from "@/app/core/service/general.service";
import {useUserStore} from "@/app/core/stores/auth.store";


export interface RoomDTO {
    name: string,
    description: string,
    isPrivate: boolean,
    isDeleted: boolean,
    isDirectMessage: boolean
}
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

    async getAllChat(id:string,search?:string){
        const url = search === undefined || search === ""
            ? `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=true`
            : `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=true&search=${search}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.getToken()}`
            },
        })
        return await response.json();
    }

    async getAllRooms(id:string,search?:string){
        const url = search === undefined || search === ""
            ? `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=false`
            : `${this.urlBase}/rooms/user-rooms/${id}?isDirectMessage=false&search=${search}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.getToken()}`
            },
        })
        return await response.json();
    }


    async createRoom(data:RoomDTO){
        const url = `${this.urlBase}/rooms`;
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

    async joinRoom(data: {role: string, isActive: boolean, userId: string, roomId: string}){
        const url = `${this.urlBase}/room-members`;
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

}