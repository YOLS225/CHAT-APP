import {API_URL} from "@/app/core/service/general.service";

export class UsersService {
    constructor() {}
    protected urlBase = API_URL;
    private token = localStorage.getItem("token");

}