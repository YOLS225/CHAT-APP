import {API_URL} from "@/app/core/service/general.service";
import {useUserStore} from "@/app/core/stores/auth.store";

export interface UserDTO {
    userName?: string,
    email?: string,
    password?: string,
    avatar?: string,
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
        const userData: UserDTO = {
            userName: data.userName,
            email: data.email,
            password: data.password,
            ...(data.avatar ? {avatar: data.avatar} : {}),
        };
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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
