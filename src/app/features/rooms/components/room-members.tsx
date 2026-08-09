'use client'

import React from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {RoomMember, RoomsService} from "@/app/core/service/rooms.service";
import {WorkspacesService} from "@/app/core/service/workspaces.service";
import {QUERIES} from "@/app/core/utils/constants";
import {Crown, ShieldCheck, ShieldHalf, User, Users, MoreVertical, UserX, UserPlus} from "lucide-react";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {Button} from "@/app/core/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/core/components/ui/dropdown-menu";
import {toast} from "sonner";
import {getApiMessage} from "@/app/core/utils/api-message";

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
    initialMembers?: RoomMember[];
    currentMember?: RoomMember;
}

export function RoomMembersPanel({roomId, roomName, initialMembers = [], currentMember: initialCurrentMember}: RoomMembersPanelProps) {
    const roomsService = new RoomsService();
    const workspaceService = new WorkspacesService();
    const queryClient = useQueryClient();
    const currentUser = useUserStore((state) => state.result);
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const [memberToAdd, setMemberToAdd] = React.useState("");
    const [roleToAdd, setRoleToAdd] = React.useState<RoomMember["role"]>("MEMBER");

    const {data: members, isLoading} = useQuery({
        queryKey: [QUERIES.GET_ROOM_MEMBERS, roomId],
        queryFn: async () => {
            const response = await roomsService.getRoomMembers(roomId);
            return response.data ?? [];
        },
        enabled: !!roomId,
        initialData: initialMembers,
        refetchInterval: 10000,
    });

    const sorted = [...(members ?? [])].sort(
        (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]
    );

    // Rôle de l'utilisateur connecté dans cette room
    const currentMember = members?.find((m) => m.userId === currentUser?.id) ?? initialCurrentMember;
    const canManage = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";
    const canAssignOwner = currentMember?.role === "OWNER";

    const {data: workspaceUsers = []} = useQuery({
        queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId, "room-add-members"],
        queryFn: async () => {
            const response = await workspaceService.getWorkspaceUsers(workspaceId as string);
            return response.data ?? [];
        },
        enabled: !!workspaceId && canManage,
    });

    const memberIds = new Set((members ?? []).map((member) => member.userId));
    const availableUsers = workspaceUsers.filter((user) => {
        return user.membershipStatus === "ACTIVE" && !memberIds.has(user.id);
    });

    const roleMutation = useMutation({
        mutationFn: ({memberId, role}: {memberId: string; role: RoomMember["role"]}) =>
            roomsService.updateMemberRole(memberId, role),
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Rôle mis à jour.");
                void queryClient.invalidateQueries({queryKey: [QUERIES.GET_ROOM_MEMBERS, roomId]});
            } else {
                toast.error(getApiMessage(response, "Erreur lors de la mise à jour du rôle."));
            }
        },
        onError: (response) => toast.error(getApiMessage(response, "Erreur lors de la mise à jour du rôle.")),
    });

    const kickMutation = useMutation({
        mutationFn: (memberId: string) => roomsService.kickMember(memberId),
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Membre retiré du groupe.");
                void queryClient.invalidateQueries({queryKey: [QUERIES.GET_ROOM_MEMBERS, roomId]});
            } else {
                toast.error(getApiMessage(response, "Erreur lors du retrait."));
            }
        },
        onError: (response) => toast.error(getApiMessage(response, "Erreur lors du retrait.")),
    });

    const addMemberMutation = useMutation({
        mutationFn: ({userId, role}: {userId: string; role: RoomMember["role"]}) =>
            roomsService.addRoomMember(roomId, {userId, role}),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(getApiMessage(response, "Impossible d'ajouter ce membre."));
                return;
            }

            setMemberToAdd("");
            setRoleToAdd("MEMBER");
            await queryClient.invalidateQueries({queryKey: [QUERIES.GET_ROOM_MEMBERS, roomId]});
            toast.success("Membre ajouté à la salle.");
        },
        onError: (response) => toast.error(getApiMessage(response, "Impossible d'ajouter ce membre.")),
    });

    const handleAddMember = () => {
        if (!memberToAdd) {
            toast.error("Sélectionnez un collaborateur.");
            return;
        }

        if (roleToAdd === "OWNER" && !canAssignOwner) {
            toast.error("Seul un OWNER peut ajouter un autre OWNER.");
            return;
        }

        addMemberMutation.mutate({userId: memberToAdd, role: roleToAdd});
    };

    return (
        <div className="h-full bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground"/>
                    <h5 className="text-base font-semibold text-foreground truncate">
                        Membres
                    </h5>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {isLoading ? "—" : `${sorted.length} membre${sorted.length > 1 ? "s" : ""} · ${roomName ?? ""}`}
                </p>
                {canManage && (
                    <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                        <p className="text-xs font-medium text-foreground">Ajouter un membre</p>
                        <select
                            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                            value={memberToAdd}
                            onChange={(event) => setMemberToAdd(event.target.value)}
                        >
                            <option value="">Collaborateur actif...</option>
                            {availableUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.userName} · {user.email}
                                </option>
                            ))}
                        </select>
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                            <select
                                className="h-9 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                value={roleToAdd}
                                onChange={(event) => setRoleToAdd(event.target.value as RoomMember["role"])}
                            >
                                <option value="MEMBER">MEMBER</option>
                                <option value="MODERATOR">MODERATOR</option>
                                <option value="ADMIN">ADMIN</option>
                                {canAssignOwner && <option value="OWNER">OWNER</option>}
                            </select>
                            <Button
                                size="sm"
                                onClick={handleAddMember}
                                disabled={!memberToAdd || addMemberMutation.isPending}
                            >
                                <UserPlus className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                )}
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
                    const canManageTarget = canManage && !isCurrentUser && (canAssignOwner || !isOwner);
                    const canKick = canManageTarget;
                    const availableRoles: RoomMember["role"][] = canAssignOwner
                        ? ["OWNER", "ADMIN", "MODERATOR", "MEMBER"]
                        : ["ADMIN", "MODERATOR", "MEMBER"];
                    const roleActions = availableRoles.filter((targetRole) => targetRole !== member.role);

                    return (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
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
                            {(canManageTarget || canKick) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                            <MoreVertical className="w-4 h-4 text-gray-500"/>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        {canManageTarget && roleActions.map((targetRole) => (
                                            <DropdownMenuItem
                                                key={targetRole}
                                                onClick={() => roleMutation.mutate({memberId: member.id, role: targetRole})}
                                                disabled={roleMutation.isPending}
                                            >
                                                {ROLE_CONFIG[targetRole].icon}
                                                <span className="ml-2">Définir {targetRole}</span>
                                            </DropdownMenuItem>
                                        ))}
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
