import {API_URL} from "@/app/core/service/general.service";
import {useUserStore} from "@/app/core/stores/auth.store";

export class UsersService {
    constructor() {}
    protected urlBase = API_URL;

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            const user = useUserStore.getState().result;
            return user?.token || null;
        }
        return null;
    }


    async getAllUsers(page?:1,page_size?:100000,search?:string){
        const url = search === undefined || search === ""
            ? `${this.urlBase}/users?page=${page}&page_size=${page_size}`
            : `${this.urlBase}/users?page=${page}&page_size=${page_size}&search=${search}`;
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