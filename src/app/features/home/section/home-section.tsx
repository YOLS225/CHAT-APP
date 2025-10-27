'use client'

import {Layout} from "@/app/core/components/widgets/layout/layout";
import {Card} from "@/app/core/components/ui/card";
import {Button} from "@/app/core/components/ui/button";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useRouter} from "next/navigation";
import {
    MessageCircle,
    DoorOpen,
    Users,
    TrendingUp,
    Plus,
    Send,
    Activity,
    Clock
} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {RoomsService} from "@/app/core/service/rooms.service";
import {QUERIES} from "@/app/core/utils/constants";

export function HomeHeader() {
    const user = useUserStore((state) => state.result);
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir";

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {greeting}, {user?.userName || "Utilisateur"} !
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Bienvenue sur votre espace de communication
                </p>
            </div>
        </div>
    );
}

export function HomeSection() {
    const router = useRouter();
    const user = useUserStore((state) => state.result);
    const userId = user?.id;
    const roomService = new RoomsService();

    // Récupérer les statistiques
    const {data: roomsData} = useQuery({
        queryKey: [QUERIES.GET_ROOMS, userId],
        queryFn: async () => {
            const response = await roomService.getAllRooms(userId as string);
            return response.data;
        },
        enabled: !!userId,
    });

    const {data: chatsData} = useQuery({
        queryKey: [QUERIES.GET_CHATS, userId],
        queryFn: async () => {
            const response = await roomService.getAllChat(userId as string);
            return response.data;
        },
        enabled: !!userId,
    });

    const roomsCount = roomsData?.length || 0;
    const chatsCount = chatsData?.length || 0;

    const stats = [
        {
            title: "Salles",
            value: roomsCount,
            icon: <DoorOpen className="w-6 h-6"/>,
            color: "bg-blue-500",
            textColor: "text-blue-500",
            bgLight: "bg-blue-50 dark:bg-blue-950"
        },
        {
            title: "Messages directs",
            value: chatsCount,
            icon: <MessageCircle className="w-6 h-6"/>,
            color: "bg-green-500",
            textColor: "text-green-500",
            bgLight: "bg-green-50 dark:bg-green-950"
        },
        {
            title: "Membres actifs",
            value: "12+",
            icon: <Users className="w-6 h-6"/>,
            color: "bg-purple-500",
            textColor: "text-purple-500",
            bgLight: "bg-purple-50 dark:bg-purple-950"
        },
        {
            title: "Activité",
            value: <TrendingUp className="w-8 h-8"/>,
            icon: <Activity className="w-6 h-6"/>,
            color: "bg-orange-500",
            textColor: "text-orange-500",
            bgLight: "bg-orange-50 dark:bg-orange-950"
        }
    ];

    const quickActions = [
        {
            title: "Créer une salle",
            description: "Démarrer une nouvelle conversation de groupe",
            icon: <Plus className="w-5 h-5"/>,
            action: () => router.push("/rooms"),
            color: "bg-primary hover:bg-primary/90"
        },
        {
            title: "Envoyer un message",
            description: "Commencer une discussion privée",
            icon: <Send className="w-5 h-5"/>,
            action: () => router.push("/chats"),
            color: "bg-green-600 hover:bg-green-700"
        }
    ];

    const recentActivities = [
        {
            title: "Nouvelle salle créée",
            description: "Salle 'Projet Alpha' créée par Marc",
            time: "Il y a 2h",
            icon: <DoorOpen className="w-5 h-5 text-blue-500"/>
        },
        {
            title: "Message reçu",
            description: "Sophie vous a envoyé un message",
            time: "Il y a 5h",
            icon: <MessageCircle className="w-5 h-5 text-green-500"/>
        },
        {
            title: "Nouveau membre",
            description: "3 nouveaux membres ont rejoint",
            time: "Hier",
            icon: <Users className="w-5 h-5 text-purple-500"/>
        }
    ];

    return (
        <Layout header={<HomeHeader/>}>
            <div className="space-y-6 p-6">
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <Card key={index}
                              className="p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`${stat.bgLight} ${stat.textColor} p-3 rounded-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Actions rapides */}
                    <Card className="lg:col-span-2 p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((action, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                                    onClick={action.action}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`${action.color} text-white p-3 rounded-lg`}>
                                            {action.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                {action.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {action.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Section d'inspiration */}
                        <div className="mt-6 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Astuce du jour
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Utilisez la barre de recherche pour trouver rapidement vos conversations.
                                Appuyez sur <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">Ctrl + K</kbd> pour un accès rapide !
                            </p>
                        </div>
                    </Card>

                    {/* Activité récente */}
                    <Card className="p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Activité récente</h2>
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                                    <div className="flex-shrink-0 mt-1">
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {activity.title}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {activity.description}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3 text-gray-400"/>
                                            <p className="text-xs text-gray-400">{activity.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => router.push("/rooms")}
                        >
                            Voir toutes les activités
                        </Button>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}