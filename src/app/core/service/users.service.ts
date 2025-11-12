import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export interface UserData {
    id: string;
    userName: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

export class UsersService {
    constructor() {}
    protected urlBase = API_URL;

    async getAllUsers(page?:1, page_size?:100000, search?:string): Promise<Action<UserData[]>>{
        const url = search === undefined || search === ""
            ? `${this.urlBase}/users?page=${page}&page_size=${page_size}`
            : `${this.urlBase}/users?page=${page}&page_size=${page_size}&search=${search}`;

        return await apiFetchJson<Action<UserData[]>>(url);
    }

}