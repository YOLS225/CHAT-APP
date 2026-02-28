'use client'

import React from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {RoomMember, RoomsService} from "@/app/core/service/rooms.service";
import {QUERIES} from "@/app/core/utils/constants";
import {Crown, ShieldCheck, ShieldHalf, User, Users, MoreVertical, ShieldPlus, UserX} from "lucide-react";
import {useUserStore} from "@/app/core/stores/auth.store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/core/components/ui/dropdown-menu";
import {toast} from "sonner";

const ROLE_CONFIG: Record<RoomMember["role"], { label: string; icon: React.ReactElement; className: string }> = {
    OWNER:     { label: "Propriétaire", icon: <Crown className="w-3 h-3"/>,       className: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400" },
    ADMIN:     { label: "Admin",        icon: <ShieldCheck className="w-3 h-3"/>, className: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400" },
    MODERATOR: { label: "Modérateur",   icon: <ShieldHalf className="w-3 h-3"/>,  className: "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400" },
    MEMBER:    { label: "Membre",       icon: <User className="w-3 h-3"/>,         className: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400" },
};

const ROLE_ORDER: Record<RoomMember["role"], number> = {
    OWNER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3,
};

function formatJoinedAt(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric", month: "short", year: "numeric",
    });
}

interface RoomMembersPanelProps {
    roomId: string;
    roomName?: string;
}

export function RoomMembersPanel({roomId, roomName}: RoomMembersPanelProps) {
    const roomsService = new RoomsService();
    const queryClient = useQueryClient();
    const currentUser = useUserStore((state) => state.result);

    const {data: members, isLoading} = useQuery({
        queryKey: [QUERIES.GET_ROOM_MEMBERS, roomId],
        queryFn: async () => {
            const response = await roomsService.getRoomMembers(roomId);
            return response.data ?? [];
        },
        enabled: !!roomId,
        refetchInterval: 10000,
    });

    const sorted = [...(members ?? [])].sort(
        (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]
    );

    // Rôle de l'utilisateur connecté dans cette room
    const currentMember = members?.find((m) => m.userId === currentUser?.id);
    const canManage = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";

    const roleMutation = useMutation({
        mutationFn: ({memberId, role}: {memberId: string; role: RoomMember["role"]}) =>
            roomsService.updateMemberRole(memberId, role),
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Rôle mis à jour.");
                void queryClient.invalidateQueries({queryKey: [QUERIES.GET_ROOM_MEMBERS, roomId]});
            } else {
                toast.error(response.message ?? "Erreur lors de la mise à jour du rôle.");
            }
        },
        onError: () => toast.error("Une erreur est survenue."),
    });

    const kickMutation = useMutation({
        mutationFn: (memberId: string) => roomsService.kickMember(memberId),
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Membre retiré du groupe.");
                void queryClient.invalidateQueries({queryKey: [QUERIES.GET_ROOM_MEMBERS, roomId]});
            } else {
                toast.error(response.message ?? "Erreur lors du retrait.");
            }
        },
        onError: () => toast.error("Une erreur est survenue."),
    });

    return (
        <div className="h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500"/>
                    <h5 className="text-base font-bold text-gray-900 dark:text-white truncate">
                        Membres
                    </h5>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {isLoading ? "—" : `${sorted.length} membre${sorted.length > 1 ? "s" : ""} · ${roomName ?? ""}`}
                </p>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {isLoading && (
                    <div className="space-y-2 pt-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"/>
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"/>
                                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && sorted.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Aucun membre
                    </p>
                )}

                {!isLoading && sorted.map((member) => {
                    const role = ROLE_CONFIG[member.role];
                    const avatarLetter = member.user.userName[0].toUpperCase();
                    const avatarUrl = member.user.avatar;
                    const hasImage = avatarUrl?.startsWith("http") || avatarUrl?.startsWith("data:");
                    const isCurrentUser = member.userId === currentUser?.id;
                    const isOwner = member.role === "OWNER";
                    // Peut promouvoir : si le membre n'est pas déjà ADMIN/OWNER et que ce n'est pas soi-même
                    const canPromote = canManage && !isCurrentUser && !isOwner && member.role !== "ADMIN";
                    // Peut kick : tout le monde sauf l'OWNER et soi-même
                    const canKick = canManage && !isCurrentUser && !isOwner;

                    return (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                        >
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden">
                                {hasImage
                                    // eslint-disable-next-line @next/next/no-img-element
                                    ? <img src={avatarUrl} alt={member.user.userName} className="w-full h-full object-cover"/>
                                    : avatarLetter
                                }
                            </div>

                            {/* Infos */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {member.user.userName}
                                    {isCurrentUser && (
                                        <span className="text-xs text-gray-400 ml-1">(vous)</span>
                                    )}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${role.className}`}>
                                        {role.icon}
                                        {role.label}
                                    </span>
                                    <span className="text-xs text-gray-400 truncate">
                                        {formatJoinedAt(member.joinedAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Menu actions — visible uniquement pour OWNER/ADMIN, sur les membres concernés */}
                            {(canPromote || canKick) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                            <MoreVertical className="w-4 h-4 text-gray-500"/>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        {canPromote && (
                                            <DropdownMenuItem
                                                onClick={() => roleMutation.mutate({memberId: member.id, role: "ADMIN"})}
                                                disabled={roleMutation.isPending}
                                            >
                                                <ShieldPlus className="w-4 h-4 mr-2 text-blue-500"/>
                                                Nommer Admin
                                            </DropdownMenuItem>
                                        )}
                                        {canKick && (
                                            <DropdownMenuItem
                                                onClick={() => kickMutation.mutate(member.id)}
                                                disabled={kickMutation.isPending}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <UserX className="w-4 h-4 mr-2"/>
                                                Retirer du groupe
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}