import {create} from "zustand";
import { persist } from "zustand/middleware";
import {loadState, resetState, saveState} from "@/app/core/stores/local-storage";


export interface User {
    id?: string;
    userName: string;
    email: boolean;
    avatar?: boolean;
    isOnline?: boolean;
    lastSeen?:string;
    status?:string;
    token?: string;
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
        (set) => ({
            result: undefined as User | undefined,
            resetUser: () => {
                saveState(storeName, {});
                set({result: undefined});
            },
            setUser: (data: User) => {
                saveState(storeName, data);
                set({result: data});
            },
            initStore: () => {
                const state = loadState<User>(storeName);
                set({result: state as User | undefined});
                return state as User | undefined;
            },
            resetStore: () => {
                resetState(storeName, {});
                set({result: undefined});
            },
        }),
        {name: storeName}
    )
);

