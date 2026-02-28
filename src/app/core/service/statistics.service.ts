import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export interface MessagesByDay {
    date: string;
    count: number;
}

export interface TopConversation {
    roomId: string;
    roomName: string;
    messageCount: number;
    lastMessageAt: string;
}

export interface ActiveConversation {
    roomId: string;
    roomName: string;
    messageCount: number;
}

export interface RecentActivity {
    type: "ROOM_JOINED" | "MESSAGE_RECEIVED" | string;
    description: string;
    roomId: string;
    roomName: string;
    timestamp: string;
}

export interface UserStatisticsOverview {
    messagesByDay: MessagesByDay[];
    averageResponseTime: number;
    topConversations: TopConversation[];
    activeConversations: ActiveConversation[];
    recentActivities: RecentActivity[];
    totalMessagesSent: number;
}

export class StatisticsService {
    constructor() {}
    protected urlBase = API_URL;

    async getUserOverview(userId: string): Promise<Action<UserStatisticsOverview>> {
        const url = `${this.urlBase}/statistics/user/${userId}/overview`;
        return await apiFetchJson<Action<UserStatisticsOverview>>(url);
    }
}