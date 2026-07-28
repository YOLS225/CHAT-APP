import {create} from "zustand";
import { persist } from "zustand/middleware";


export interface User {
    id?: string;
    userName: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
    status?: string;
    platformRole?: "SUPER_ADMIN" | "USER";
    token?: string;
    refreshToken?: string;
}

// Interface pour la réponse API complète
export interface AuthResponse {
    data: {
        token: string;
        refreshToken: string;
            user: {
                id: string;
                userName: string;
                email: string;
                isOnline: boolean;
                avatar?: string;
                platformRole?: "SUPER_ADMIN" | "USER";
            };
    };
    success: boolean;
    message: string;
}

// Interface pour la réponse du refresh
export interface RefreshResponse {
    data: {
        token: string;
        refreshToken?: string;
    };
    success: boolean;
    message: string;
}

interface UserStore {
    result?: User;
    resetUser: () => void;
    setUser: (newResult: User) => void;
    initStore: () => User | undefined;
    resetStore: () => void;
}


const storeName = "User-store";


export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            result: undefined as User | undefined,
            resetUser: () => {
                set({result: undefined});
            },
            setUser: (data: User) => {
                set({result: data});
            },
            initStore: () => {
                return get().result;
            },
            resetStore: () => {
                set({result: undefined});
            },
        }),
        {name: storeName}
    )
);
