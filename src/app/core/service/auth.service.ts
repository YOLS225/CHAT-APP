import {API_URL} from "@/app/core/service/general.service";
import {useUserStore} from "@/app/core/stores/auth.store";

export interface UserDTO {
    username?: string,
    email?: string,
    password?: string,
    avatar?: string,
    isOnline?: boolean
}

export class AuthService {
    constructor() {}
    protected urlBase = API_URL;

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            const user = useUserStore.getState().result;
            return user?.token || null;
        }
        return null;
    }

    private getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            const user = useUserStore.getState().result;
            return user?.refreshToken || null;
        }
        return null;
    }

    async login(data:{email:string, password:string}){
         const url = `${this.urlBase}/auth/login`;
         const response = await fetch(url, {
             method: "POST",
             headers: {
                 "Content-Type": "application/json",
             },
             body: JSON.stringify(data),
         });
        return await response.json();
    }

    async logout(id:string|undefined){
        const url = `${this.urlBase}/auth/logout/${id}`;
        const token = this.getToken();
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            },
        });
        return await response.json();
    }

    async register(data:UserDTO & {conditions?: boolean}){
        const url = `${this.urlBase}/users`;
        // Filtrer le champ conditions avant d'envoyer à l'API
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {conditions, ...userData} = data;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(userData),
        });
        return await response.json();
    }

    async refreshAccessToken(){
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        const url = `${this.urlBase}/auth/refresh`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Failed to refresh token");
        }

        return await response.json();
    }

    async acceptInvitation(data: {token: string; password: string}) {
        const url = `${this.urlBase}/auth/accept-invitation`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    }

}
